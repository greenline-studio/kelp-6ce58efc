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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, description, budget, timeWindow, vibes, crewSize } = await req.json();

    const YELP_API_KEY = Deno.env.get('YELP_API_KEY');
    if (!YELP_API_KEY) {
      console.error('YELP_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Yelp API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating flow for:', { location, description, budget, timeWindow, vibes, crewSize });

    // Map budget to price filter
    const priceMap: Record<string, string> = {
      '$': '1',
      '$$': '1,2',
      '$$$': '1,2,3',
      '$$$$': '1,2,3,4',
    };
    const priceFilter = priceMap[budget] || '1,2,3';

    // Determine categories based on vibes and time
    const categories = determineCategories(vibes, timeWindow);
    
    // Search for businesses
    const businesses = await searchYelpBusinesses(YELP_API_KEY, location, categories, priceFilter);

    if (!businesses || businesses.length === 0) {
      console.log('No businesses found, returning fallback');
      return new Response(
        JSON.stringify({ 
          stops: generateFallbackStops(timeWindow),
          totalDuration: 240,
          budgetRange: getBudgetRange(budget)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the flow from real Yelp data
    const stops = buildFlowFromBusinesses(businesses, timeWindow, vibes);

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

async function searchYelpBusinesses(apiKey: string, location: string, categories: string[], priceFilter: string) {
  const allBusinesses: any[] = [];

  for (const category of categories) {
    try {
      const params = new URLSearchParams({
        location,
        categories: category,
        price: priceFilter,
        limit: '5',
        sort_by: 'rating',
      });

      const response = await fetch(`https://api.yelp.com/v3/businesses/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Yelp API error for ${category}:`, response.status);
        continue;
      }

      const data = await response.json();
      if (data.businesses && data.businesses.length > 0) {
        allBusinesses.push(...data.businesses);
      }
    } catch (error) {
      console.error(`Error searching ${category}:`, error);
    }
  }

  // Remove duplicates by id
  const uniqueBusinesses = allBusinesses.filter(
    (business, index, self) => index === self.findIndex(b => b.id === business.id)
  );

  return uniqueBusinesses;
}

function determineCategories(vibes: string[], timeWindow: string): string[] {
  const categories: string[] = [];

  // Base categories for different time windows
  if (timeWindow === 'afternoon') {
    categories.push('cafes', 'desserts', 'parks');
  } else if (timeWindow === 'evening') {
    categories.push('restaurants', 'bars', 'cocktailbars');
  } else if (timeWindow === 'late night') {
    categories.push('bars', 'nightlife', 'danceclubs');
  }

  // Add vibe-specific categories
  if (vibes.includes('romantic')) {
    categories.push('wine_bars', 'french', 'italian');
  }
  if (vibes.includes('adventurous')) {
    categories.push('escapegames', 'arcades', 'karaoke');
  }
  if (vibes.includes('chill')) {
    categories.push('lounges', 'coffee', 'bookstores');
  }
  if (vibes.includes('bougie')) {
    categories.push('steak', 'seafood', 'champagne_bars');
  }
  if (vibes.includes('lively')) {
    categories.push('sportsbars', 'beergardens', 'breweries');
  }

  return [...new Set(categories)].slice(0, 5);
}

function buildFlowFromBusinesses(businesses: any[], timeWindow: string, vibes: string[]): FlowStop[] {
  // Sort by rating and take top businesses
  const sortedBusinesses = businesses
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4);

  // Determine start time based on time window
  let startHour = timeWindow === 'afternoon' ? 14 : timeWindow === 'evening' ? 18 : 21;

  const stops: FlowStop[] = sortedBusinesses.map((business, index) => {
    const duration = getDurationForCategory(business.categories?.[0]?.alias || 'restaurant');
    const time = formatTime(startHour, index === 0 ? 0 : 30);
    startHour += Math.ceil(duration / 60);

    return {
      id: business.id,
      name: business.name,
      category: business.categories?.[0]?.title || 'Restaurant',
      rating: business.rating || 4.0,
      price: business.price || '$$',
      reason: generateReason(business, vibes),
      time,
      duration,
      tags: generateTags(business, vibes),
      yelpUrl: business.url,
      imageUrl: business.image_url,
    };
  });

  return stops;
}

function getDurationForCategory(category: string): number {
  const durations: Record<string, number> = {
    restaurants: 90,
    bars: 60,
    cocktailbars: 60,
    cafes: 45,
    nightlife: 90,
    danceclubs: 120,
    wine_bars: 75,
    desserts: 30,
    arcades: 60,
    karaoke: 90,
  };
  return durations[category] || 60;
}

function formatTime(hour: number, minuteOffset: number): string {
  const totalMinutes = hour * 60 + minuteOffset;
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
}

function generateReason(business: any, vibes: string[]): string {
  const category = business.categories?.[0]?.title || 'spot';
  const rating = business.rating || 4.0;
  
  const reasons = [
    `Highly-rated ${category.toLowerCase()} with ${rating}★ reviews`,
    `Perfect ${category.toLowerCase()} for your ${vibes[0] || 'chill'} vibe`,
    `Top pick in the area - ${rating}★ and great atmosphere`,
    `Local favorite known for excellent service and ambiance`,
  ];
  
  return reasons[Math.floor(Math.random() * reasons.length)];
}

function generateTags(business: any, vibes: string[]): string[] {
  const tags: string[] = [];
  
  // Add category-based tags
  if (business.categories) {
    tags.push(...business.categories.slice(0, 2).map((c: any) => c.title));
  }
  
  // Add rating tag if high
  if (business.rating >= 4.5) {
    tags.push('Top Rated');
  }
  
  // Add relevant vibe tags
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

function generateFallbackStops(timeWindow: string): FlowStop[] {
  const startHour = timeWindow === 'afternoon' ? 14 : timeWindow === 'evening' ? 18 : 21;
  
  return [
    {
      id: 'fallback-1',
      name: 'Local Favorite Spot',
      category: 'Restaurant',
      rating: 4.5,
      price: '$$',
      reason: 'A great starting point for your outing',
      time: formatTime(startHour, 0),
      duration: 60,
      tags: ['Popular', 'Great Food'],
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    },
    {
      id: 'fallback-2',
      name: 'Cozy Bar & Lounge',
      category: 'Bar',
      rating: 4.3,
      price: '$$',
      reason: 'Perfect atmosphere to continue the evening',
      time: formatTime(startHour + 1, 30),
      duration: 60,
      tags: ['Cozy', 'Great Drinks'],
      imageUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=300&fit=crop',
    },
  ];
}
