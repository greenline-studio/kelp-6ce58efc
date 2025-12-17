# Yelp API Integration Guide

## Overview

This document outlines the integration strategy for connecting Kelp to the Yelp AI API.

## API Credentials

**⚠️ IMPORTANT**: The Yelp API credentials should be stored as secrets in Lovable Cloud, NOT in the codebase.

Required secrets to add:
- `YELP_API_KEY` - Your Yelp API key
- `YELP_CLIENT_ID` - Your Yelp Client ID (optional)

## API Endpoints

### 1. Yelp AI Chat API (Primary)

**Endpoint**: `POST https://api.yelp.com/v3/ai/chat`

**Purpose**: Generate intelligent recommendations based on natural language queries.

**Request Example**:
```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are Kelp, an AI that creates short, realistic micro-itineraries using Yelp businesses near the user's location. Always return reasoning plus a strict JSON block with 2-5 ordered stops."
    },
    {
      "role": "user",
      "content": "User is in: Houston, Texas. Mood: First date, not too loud, 3-4 hours total, budget-friendly but nice."
    }
  ]
}
```

**Expected Response Structure**:
```json
{
  "response": "Here's a perfect 3-stop flow for your date night in Houston...",
  "stops": [
    {
      "name": "The Velvet Room",
      "yelp_business_id": "abc123",
      "category": "Cocktail Bar",
      "price_level": "$$",
      "approximate_duration_minutes": 60,
      "why_this_stop": "Intimate rooftop with great cocktails",
      "recommended_time_of_day": "7:00 PM"
    }
  ]
}
```

### 2. Business Search API (Supplementary)

**Endpoint**: `GET https://api.yelp.com/v3/businesses/search`

**Purpose**: Search for businesses by criteria when needed.

**Parameters**:
- `location` - City, address, or coordinates
- `term` - Search term
- `categories` - Filter by category
- `price` - Price filter (1-4)
- `attributes` - Special attributes (outdoor_seating, etc.)

### 3. Business Details API

**Endpoint**: `GET https://api.yelp.com/v3/businesses/{id}`

**Purpose**: Get detailed info about a specific business.

## Edge Function Implementation

### Create Flow Function

```typescript
// supabase/functions/create-flow/index.ts

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, scenario, constraints } = await req.json();
    const YELP_API_KEY = Deno.env.get('YELP_API_KEY');

    // Build system prompt
    const systemPrompt = `You are Kelp, an AI that creates short, realistic micro-itineraries ("flows") using Yelp businesses near the user's location.
    
    Always return your reasoning in natural language plus a strict JSON block with 2-5 ordered stops, each including:
    - name
    - yelp_business_id  
    - category
    - price_level
    - approximate_duration_minutes
    - why_this_stop
    - recommended_time_of_day
    
    Format the JSON block like this:
    \`\`\`json
    { "stops": [...] }
    \`\`\``;

    // Build user prompt
    const userPrompt = `User is in: ${location}
    Scenario: ${scenario}
    Budget: ${constraints.budget}
    Time: ${constraints.timeWindow}
    Preferences: ${constraints.vibes?.join(', ') || 'none specified'}`;

    // Call Yelp AI Chat API
    const response = await fetch('https://api.yelp.com/v3/ai/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${YELP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Yelp API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse the response to extract stops
    const stops = parseYelpResponse(data);

    return new Response(
      JSON.stringify({ 
        flowId: crypto.randomUUID(),
        stops,
        rawResponse: data 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating flow:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function parseYelpResponse(data: any) {
  // Extract JSON from response
  const responseText = data.response || '';
  const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
  
  if (jsonMatch) {
    const parsed = JSON.parse(jsonMatch[1]);
    return parsed.stops || [];
  }
  
  return [];
}
```

## Integration Steps

1. **Enable Lovable Cloud**
   - Required for edge functions and secrets

2. **Add API Key as Secret**
   - Name: `YELP_API_KEY`
   - Value: (the API key from above)

3. **Create Edge Function**
   - File: `supabase/functions/create-flow/index.ts`

4. **Update Frontend**
   - Replace mock data with API calls
   - Handle loading/error states

5. **Test Flow Generation**
   - Verify responses parse correctly
   - Handle edge cases

## Error Handling

- **401 Unauthorized**: Invalid API key
- **429 Rate Limited**: Too many requests
- **500 Server Error**: Yelp API issue

Always provide fallback mock data when API fails to ensure good UX during demo.
