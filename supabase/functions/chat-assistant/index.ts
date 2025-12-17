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

    console.log("Chat assistant received:", { message, hasFlow: !!flow, historyLength: conversationHistory?.length });

    // Build detailed context about current flow
    let flowContext = "";
    if (flow && flow.stops && flow.stops.length > 0) {
      flowContext = `
CURRENT ITINERARY (${flow.stops.length} stops):
${flow.stops.map((stop: FlowStop, i: number) => 
`Stop ${i + 1}: "${stop.name}"
  - Category: ${stop.category}
  - Time: ${stop.time}
  - Duration: ${stop.duration} minutes
  - Price: ${stop.price}
  - Rating: ${stop.rating}★
  - Why: ${stop.reason}
  - Tags: ${stop.tags.join(", ")}`).join("\n\n")}

Total Duration: ${flow.totalDuration} minutes
Budget: ${flow.budgetRange}
`;
    }

    const systemPrompt = `You are Kelp AI Assistant, a smart and helpful AI that helps users refine their night out itinerary.

${flowContext ? flowContext : "No itinerary created yet - suggest the user fill out the form first."}

YOUR CAPABILITIES:
1. Swap stops for different venues (cheaper, different vibe, different cuisine)
2. Remove stops from the itinerary
3. Suggest timing adjustments
4. Provide local tips and recommendations

CRITICAL - WHEN TO INCLUDE FLOW CHANGES:
When the user asks to modify their flow (swap a stop, remove something, change a venue), you MUST include a JSON block with your changes.

FORMAT FOR FLOW CHANGES (include this EXACTLY when making modifications):
\`\`\`json
{
  "action": "update_flow",
  "changes": {
    "swap": [
      {
        "stopIndex": 0,
        "newStop": {
          "name": "New Venue Name",
          "category": "Restaurant",
          "rating": 4.5,
          "price": "$$",
          "reason": "Why this is a better choice",
          "duration": 90,
          "tags": ["Tag1", "Tag2", "Tag3"]
        }
      }
    ],
    "remove": []
  }
}
\`\`\`

RULES:
- stopIndex is 0-based (first stop = 0, second = 1, etc.)
- For swaps: provide complete newStop object with all fields
- For removals: add the stopIndex numbers to the "remove" array
- You can combine swaps and removes in one response
- ONLY include the JSON block when making actual changes to the flow
- For general questions/tips, just respond conversationally without JSON

EXAMPLES:
- "Make it cheaper" → Swap expensive stops for budget-friendly alternatives, include JSON
- "Remove the second stop" → Add 1 to the remove array, include JSON  
- "What's good about this bar?" → Just answer the question, no JSON
- "Swap the restaurant for Italian" → Swap that stop with an Italian restaurant, include JSON

Be friendly, helpful, and concise. Always explain WHY your suggestion improves their experience.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(conversationHistory || []),
      { role: "user", content: message },
    ];

    console.log("Calling Lovable AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 1500,
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

    console.log("AI response received:", assistantMessage.substring(0, 200));

    // Parse any flow changes from the response
    let flowChanges = null;
    const jsonMatch = assistantMessage.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.action === "update_flow" && parsed.changes) {
          flowChanges = parsed;
          console.log("Parsed flow changes:", JSON.stringify(flowChanges));
        }
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
