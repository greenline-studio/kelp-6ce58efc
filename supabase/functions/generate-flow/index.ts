import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FlowStop {
  id: string;
  name: string;
  category: string;
  rating: number;
  price: string;
  reason: string;
  time: string;
  duration: number;
  tags: string[];
  yelpUrl?: string;
  imageUrl?: string;
}

interface PlanStep {
  type: string;
  yelpCategory: string;
  searchTerm: string;
  duration: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, description, budget, timeWindow, vibes, crewSize } = await req.json();

    const YELP_API_KEY = Deno.env.get('YELP_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!YELP_API_KEY) {
      console.error('YELP_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Yelp API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating flow for:', { location, description, budget, timeWindow, vibes, crewSize });

    // Map budget to Yelp price filter
    const budgetToPriceMap: Record<string, string> = {
      '$': '1',
      '$$': '1,2',
      '$$$': '1,2,3',
      '$$$$': '1,2,3,4',
    };
    const priceFilter = budgetToPriceMap[budget] || '1,2,3';

    // Use AI to understand the user's plan and determine appropriate venue types
    let planSteps: PlanStep[] = [];
    
    if (LOVABLE_API_KEY) {
      planSteps = await analyzePlanWithAI(LOVABLE_API_KEY, description, timeWindow, vibes);
      console.log('AI determined plan steps:', planSteps);
    }
    
    // Fallback if AI fails or no API key
    if (planSteps.length === 0) {
      planSteps = getDefaultPlanSteps(description, timeWindow, vibes);
      console.log('Using default plan steps:', planSteps);
    }

    // Search Yelp for each step in the plan
    const stops: FlowStop[] = [];
    let currentHour = getStartHour(timeWindow);
    
    for (let i = 0; i < planSteps.length; i++) {
      const step = planSteps[i];
      const business = await searchYelpForStep(YELP_API_KEY, location, step, priceFilter);
      
      if (business) {
        const time = formatTime(currentHour, 0);
        stops.push({
          id: business.id || `stop-${i}`,
          name: business.name,
          category: business.categories?.[0]?.title || step.type,
          rating: business.rating || 4.0,
          price: business.price || '$$',
          reason: generateSmartReason(business, step, vibes),
          time,
          duration: step.duration,
          tags: generateSmartTags(business, step, vibes),
          yelpUrl: business.url,
          imageUrl: business.image_url,
        });
        currentHour += Math.ceil(step.duration / 60);
      }
    }

    if (stops.length === 0) {
      console.log('No businesses found, returning fallback');
      return new Response(
        JSON.stringify({ 
          stops: generateFallbackStops(timeWindow, description),
          totalDuration: 240,
          budgetRange: getBudgetRange(budget)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const totalDuration = stops.reduce((sum, stop) => sum + stop.duration, 0);
    console.log('Generated flow with', stops.length, 'stops');

    return new Response(
      JSON.stringify({
        stops,
        totalDuration,
        budgetRange: getBudgetRange(budget)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating flow:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate flow' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function analyzePlanWithAI(apiKey: string, description: string, timeWindow: string, vibes: string[]): Promise<PlanStep[]> {
  try {
    const prompt = `Analyze this outing plan and extract the distinct activities/stops the user wants.

User's plan: "${description}"
Time of day: ${timeWindow}
Vibes: ${vibes.join(', ') || 'casual'}

Return a JSON array of 2-5 stops. Each stop should have:
- type: human readable activity type (e.g., "Sightseeing", "Lunch", "Bar", "Nightclub", "Coffee", "Museum", "Park", "Dinner", "Rooftop Bar", "Jazz Club")
- yelpCategory: the Yelp API category to search (use valid Yelp categories like: landmarks, restaurants, bars, nightlife, danceclubs, cafes, museums, parks, cocktailbars, lounges, winebars, breakfast_brunch, italian, japanese, mexican, steakhouses, seafood, pizza)
- searchTerm: additional search term to find the right venue (e.g., "rooftop", "live music", "craft cocktails")  
- duration: estimated time in minutes (30-120)

IMPORTANT: Parse the user's description to understand what they ACTUALLY want. If they say "sightseeing, lunch, bar, nightclub" - create stops for each of those, not just restaurants.

Respond ONLY with the JSON array, no other text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 1024,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('AI analysis failed:', response.status);
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((step: any) => ({
          type: step.type || 'Activity',
          yelpCategory: step.yelpCategory || 'restaurants',
          searchTerm: step.searchTerm || '',
          duration: step.duration || 60,
        }));
      }
    }
    
    return [];
  } catch (error) {
    console.error('AI analysis error:', error);
    return [];
  }
}

function getDefaultPlanSteps(description: string, timeWindow: string, vibes: string[]): PlanStep[] {
  const desc = description.toLowerCase();
  const steps: PlanStep[] = [];
  
  // Parse common activities from description
  if (desc.includes('sightseeing') || desc.includes('sight seeing') || desc.includes('tourist') || desc.includes('explore')) {
    steps.push({ type: 'Sightseeing', yelpCategory: 'landmarks', searchTerm: 'tourist attractions', duration: 90 });
  }
  if (desc.includes('museum') || desc.includes('art') || desc.includes('gallery')) {
    steps.push({ type: 'Museum', yelpCategory: 'museums', searchTerm: '', duration: 90 });
  }
  if (desc.includes('brunch')) {
    steps.push({ type: 'Brunch', yelpCategory: 'breakfast_brunch', searchTerm: 'brunch', duration: 75 });
  }
  if (desc.includes('lunch') || desc.includes('eat')) {
    steps.push({ type: 'Lunch', yelpCategory: 'restaurants', searchTerm: 'lunch', duration: 75 });
  }
  if (desc.includes('dinner')) {
    steps.push({ type: 'Dinner', yelpCategory: 'restaurants', searchTerm: 'dinner', duration: 90 });
  }
  if (desc.includes('coffee') || desc.includes('cafe')) {
    steps.push({ type: 'Coffee', yelpCategory: 'cafes', searchTerm: '', duration: 45 });
  }
  if (desc.includes('bar') && !desc.includes('nightclub')) {
    steps.push({ type: 'Bar', yelpCategory: 'bars', searchTerm: 'cocktails', duration: 60 });
  }
  if (desc.includes('rooftop')) {
    steps.push({ type: 'Rooftop Bar', yelpCategory: 'bars', searchTerm: 'rooftop', duration: 60 });
  }
  if (desc.includes('nightclub') || desc.includes('club') || desc.includes('dancing')) {
    steps.push({ type: 'Nightclub', yelpCategory: 'danceclubs', searchTerm: 'nightclub', duration: 120 });
  }
  if (desc.includes('live music') || desc.includes('jazz') || desc.includes('concert')) {
    steps.push({ type: 'Live Music', yelpCategory: 'musicvenues', searchTerm: 'live music', duration: 90 });
  }
  if (desc.includes('karaoke')) {
    steps.push({ type: 'Karaoke', yelpCategory: 'karaoke', searchTerm: '', duration: 90 });
  }
  
  // If no specific activities found, create generic based on time window
  if (steps.length === 0) {
    if (timeWindow === 'afternoon') {
      steps.push(
        { type: 'Lunch', yelpCategory: 'restaurants', searchTerm: '', duration: 75 },
        { type: 'Dessert', yelpCategory: 'desserts', searchTerm: '', duration: 45 },
        { type: 'Activity', yelpCategory: 'entertainment', searchTerm: '', duration: 60 }
      );
    } else if (timeWindow === 'evening') {
      steps.push(
        { type: 'Dinner', yelpCategory: 'restaurants', searchTerm: '', duration: 90 },
        { type: 'Bar', yelpCategory: 'bars', searchTerm: '', duration: 60 },
        { type: 'Entertainment', yelpCategory: 'nightlife', searchTerm: '', duration: 60 }
      );
    } else {
      steps.push(
        { type: 'Bar', yelpCategory: 'bars', searchTerm: '', duration: 60 },
        { type: 'Nightlife', yelpCategory: 'nightlife', searchTerm: '', duration: 90 },
        { type: 'Late Night', yelpCategory: 'danceclubs', searchTerm: '', duration: 120 }
      );
    }
  }
  
  return steps.slice(0, 5);
}

async function searchYelpForStep(apiKey: string, location: string, step: PlanStep, priceFilter: string): Promise<any | null> {
  try {
    const params = new URLSearchParams({
      location,
      categories: step.yelpCategory,
      limit: '10',
      sort_by: 'rating',
    });
    
    // Add search term if provided
    if (step.searchTerm) {
      params.set('term', step.searchTerm);
    }
    
    // Only add price filter for food/drink venues, not attractions
    if (!['landmarks', 'museums', 'parks', 'entertainment'].includes(step.yelpCategory)) {
      params.set('price', priceFilter);
    }

    const response = await fetch(`https://api.yelp.com/v3/businesses/search?${params}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Yelp API error for ${step.type}:`, response.status);
      return null;
    }

    const data = await response.json();
    
    // Return a random top-rated business to add variety
    if (data.businesses && data.businesses.length > 0) {
      const topBusinesses = data.businesses.slice(0, 5);
      return topBusinesses[Math.floor(Math.random() * topBusinesses.length)];
    }
    
    return null;
  } catch (error) {
    console.error(`Error searching for ${step.type}:`, error);
    return null;
  }
}

function getStartHour(timeWindow: string): number {
  switch (timeWindow) {
    case 'morning': return 9;
    case 'afternoon': return 12;
    case 'evening': return 18;
    case 'late night': return 21;
    default: return 14;
  }
}

function formatTime(hour: number, minuteOffset: number): string {
  const totalMinutes = hour * 60 + minuteOffset;
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
}

function generateSmartReason(business: any, step: PlanStep, vibes: string[]): string {
  const rating = business.rating || 4.0;
  const reviewCount = business.review_count || 0;
  const category = business.categories?.[0]?.title || step.type;
  const vibe = vibes[0] || 'great';
  
  const templates = [
    `Top-rated ${category.toLowerCase()} with ${rating}★ from ${reviewCount}+ reviews`,
    `Perfect ${step.type.toLowerCase()} spot – ${rating}★ rating, known for ${vibe} atmosphere`,
    `Locals love this ${category.toLowerCase()} – ${rating}★ and ideal for your ${step.type.toLowerCase()}`,
    `Highly recommended for ${step.type.toLowerCase()} – ${reviewCount}+ happy visitors`,
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateSmartTags(business: any, step: PlanStep, vibes: string[]): string[] {
  const tags: string[] = [];
  
  // Add the activity type as first tag
  tags.push(step.type);
  
  // Add category from business
  if (business.categories && business.categories[0]) {
    const catTitle = business.categories[0].title;
    if (catTitle !== step.type) {
      tags.push(catTitle);
    }
  }
  
  // Add rating tag if high
  if (business.rating >= 4.5) {
    tags.push('Top Rated');
  }
  
  // Add vibe tag
  if (vibes.length > 0) {
    tags.push(vibes[0].charAt(0).toUpperCase() + vibes[0].slice(1));
  }
  
  return tags.slice(0, 3);
}

function getBudgetRange(budget: string): string {
  const ranges: Record<string, string> = {
    '$': '$20-40 per person',
    '$$': '$40-80 per person',
    '$$$': '$80-120 per person',
    '$$$$': '$120+ per person',
  };
  return ranges[budget] || '$40-80 per person';
}

function generateFallbackStops(timeWindow: string, description: string): FlowStop[] {
  const startHour = getStartHour(timeWindow);
  
  return [
    {
      id: 'fallback-1',
      name: 'Popular Local Spot',
      category: 'Activity',
      rating: 4.5,
      price: '$$',
      reason: 'A great starting point based on your preferences',
      time: formatTime(startHour, 0),
      duration: 60,
      tags: ['Popular', 'Recommended'],
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    },
    {
      id: 'fallback-2',
      name: 'Cozy Bar & Lounge',
      category: 'Bar',
      rating: 4.3,
      price: '$$',
      reason: 'Perfect atmosphere to continue your outing',
      time: formatTime(startHour + 1, 30),
      duration: 60,
      tags: ['Cozy', 'Great Drinks'],
      imageUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=300&fit=crop',
    },
  ];
}
