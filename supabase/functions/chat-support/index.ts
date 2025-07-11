import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "npm:openai@4.24.1";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }
  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      console.error("OPENAI_API_KEY environment variable is not set");
      return new Response(JSON.stringify({
        error: "OpenAI API key not configured"
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const openai = new OpenAI({
      apiKey
    });
    // Parse request body
    const { messages } = await req.json();
    // Add system message if not present
    const systemMessage = {
      role: "system",
      content: `You are a knowledgeable, friendly support assistant for inRooms — a curated virtual networking platform designed for early-stage founders, operators, and builders.

inRooms helps members go beyond traditional networking with:
- Curated Rooms by niche, stage, or role
- Tactical keynotes from real builders
- Open Build Rooms for live collaboration (like digital coworking)
- Dynamic profiles based on verified contributions
- An events calendar full of workshops, founder-focused sessions, and matchmaking
- Product and startup showcase opportunities
- Reputation system that reflects real activity and collaboration

Your role:
- Guide users through platform features and navigation
- Troubleshoot account, profile, or event issues
- Explain free trials, premium add-ons, and all subscription tiers (Starter, Professional, Enterprise, Team, Enterprise+)
- Support founders with networking best practices and usage tips
- Assist with billing, cancellations, and upgrade/downgrade processes
- Clarify what makes inRooms unique compared to static platforms like LinkedIn
- Direct users to resources and recommend Rooms/events based on their goals
- Encourage progress, not just connections

Tone:
- Friendly, encouraging, and founder-first
- Clear and concise, but never robotic
- Solution-oriented and transparent

If unsure about something or if a technical issue arises, kindly suggest they contact our team at **support@inrooms.com**.

Never forget: inRooms isn’t just networking — it’s momentum.`
    };
    const fullMessages = messages[0]?.role === "system" ? messages : [
      systemMessage,
      ...messages
    ];
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: fullMessages,
      max_tokens: 500
    });
    const responseMessage = completion.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
    return new Response(JSON.stringify({
      message: responseMessage
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error processing chat request:", error);
    return new Response(JSON.stringify({
      error: "Failed to process request",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
