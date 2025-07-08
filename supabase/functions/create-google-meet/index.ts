import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface MeetingRequest {
  title: string;
  description: string;
  startTime: string | Date;
  endTime: string | Date;
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
    const { title, description, startTime, endTime }: MeetingRequest = await req.json();

    // Validate required fields
    if (!title || !startTime || !endTime) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate a unique meeting ID
    const meetingId = generateMeetingId();
    
    // Create a Google Meet link
    const meetLink = `https://meet.google.com/${meetingId}`;

    // In a real implementation, you would use Google Calendar API to create an actual meeting
    // For this demo, we'll just return a simulated response
    
    return new Response(
      JSON.stringify({
        success: true,
        meetLink,
        title,
        description,
        startTime,
        endTime,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating Google Meet event:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to create meeting",
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Generate a random meeting ID similar to Google Meet format
function generateMeetingId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const allChars = chars + numbers;
  
  // Format: abc-defg-hij
  let id = '';
  
  // First segment (3 chars)
  for (let i = 0; i < 3; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  id += '-';
  
  // Second segment (4 chars)
  for (let i = 0; i < 4; i++) {
    id += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  id += '-';
  
  // Third segment (3 chars)
  for (let i = 0; i < 3; i++) {
    id += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  return id;
}