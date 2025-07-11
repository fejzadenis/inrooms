import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "npm:openai@4.24.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RequestBody {
  messages: Message[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      console.error("OPENAI_API_KEY environment variable is not set");
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openai = new OpenAI({
      apiKey,
    });

    // Parse request body
    const { messages }: RequestBody = await req.json();

    // Add system message if not present
    const systemMessage: Message = {
      role: "system",
      content: `You are a helpful support assistant for inRooms, a networking platform for founders and entrepreneurs.

Key features of inRooms:
- Virtual networking Rooms for founders to connect
- Profile system to showcase founder experience and startup details
- Events calendar for workshops and networking sessions
- Product showcase for startup demos
- Reputation system to build credibility

Your job is to:
- Answer questions about the platform features
- Help with account issues
- Explain subscription plans
- Provide networking tips for founders
- Guide users on how to use the platform effectively

Be friendly, helpful, and concise. If you don't know the answer to a specific question, suggest contacting the support team at support@inrooms.com.`,
    };

    const fullMessages = messages[0]?.role === "system" 
      ? messages 
      : [systemMessage, ...messages];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: fullMessages,
      max_tokens: 500,
    });

    const responseMessage = completion.choices[0].message.content || "I'm sorry, I couldn't generate a response.";

    return new Response(
      JSON.stringify({ message: responseMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing chat request:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});