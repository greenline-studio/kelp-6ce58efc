import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
}

interface Flow {
  id: string;
  stops: FlowStop[];
  totalDuration: number;
  budgetRange: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, flow, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context about current flow
    let flowContext = "";
    if (flow && flow.stops && flow.stops.length > 0) {
      flowContext = `
Current itinerary has ${flow.stops.length} stops:
${flow.stops.map((stop: FlowStop, i: number) => `${i + 1}. ${stop.name} (${stop.category}) - ${stop.time}, ${stop.duration} min, ${stop.price} - "${stop.reason}"`).join("\n")}
Total duration: ${flow.totalDuration} minutes
Budget range: ${flow.budgetRange}
`;
    }

    const systemPrompt = `You are Kelp AI Assistant, a helpful and friendly AI that helps users plan their perfect night out. You have access to the user's current itinerary and can suggest modifications.

${flowContext ? `CURRENT ITINERARY:\n${flowContext}` : "No itinerary created yet."}

CAPABILITIES:
- Suggest swapping stops for cheaper/better alternatives
- Recommend adding romantic, outdoor, or specific vibe spots
- Help adjust timing and duration
- Provide local insights and tips

RESPONSE FORMAT:
When suggesting flow changes, include a JSON block in your response using this format:
\`\`\`json
{
  "action": "update_flow",
  "changes": {
    "swap": [{"stopIndex": 0, "newStop": {"name": "New Place", "category": "Restaurant", "rating": 4.5, "price": "$$", "reason": "Better value with great atmosphere", "duration": 90, "tags": ["Cozy", "Date Night"]}}],
    "remove": [],
    "reorder": []
  }
}
\`\`\`

Only include the JSON block when you're making actual suggestions to modify the flow. For general conversation, just respond naturally.

Be concise, friendly, and helpful. When making suggestions, explain WHY the change would improve their experience.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(conversationHistory || []),
      { role: "user", content: message },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";

    // Parse any flow changes from the response
    let flowChanges = null;
    const jsonMatch = assistantMessage.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        flowChanges = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse flow changes JSON:", e);
      }
    }

    // Clean the message by removing the JSON block for display
    const cleanMessage = assistantMessage.replace(/```json\s*[\s\S]*?\s*```/g, "").trim();

    return new Response(
      JSON.stringify({ 
        message: cleanMessage,
        flowChanges,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
