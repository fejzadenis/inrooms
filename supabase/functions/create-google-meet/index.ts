import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { create, getNumericDate, Header } from "https://deno.land/x/djwt@v2.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
};

interface MeetingRequest {
  title: string;
  description?: string;
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
    const { title, description = "", startTime, endTime }: MeetingRequest = await req.json();

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

    // Get environment variables
    const privateKeyRaw = Deno.env.get("GOOGLE_PRIVATE_KEY");
    const clientEmail = Deno.env.get("GOOGLE_CLIENT_EMAIL");
    
    if (!privateKeyRaw || !clientEmail) {
      console.error("Missing Google API credentials in environment variables");
      return new Response(
        JSON.stringify({ 
          error: "Server configuration error", 
          details: "Google API credentials not configured" 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    try {
      // Create a real Google Meet link
      const meetLink = await createGoogleMeet({
        title,
        description,
        startTime: typeof startTime === 'string' ? startTime : startTime.toISOString(),
        endTime: typeof endTime === 'string' ? endTime : endTime.toISOString(),
      });
      
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
    } catch (googleError) {
      console.error("Error creating Google Meet event:", googleError);
      
      // If Google API fails, fall back to a mock link for development
      if (Deno.env.get("ENVIRONMENT") === "development") {
        const mockMeetLink = `https://meet.google.com/${generateMeetingId()}`;
        console.log("Using mock Meet link for development:", mockMeetLink);
        
        return new Response(
          JSON.stringify({
            success: true,
            meetLink: mockMeetLink,
            title,
            description,
            startTime,
            endTime,
            mock: true
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      throw googleError;
    }
  } catch (error) {
    console.error("Error creating Google Meet event:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to create meeting",
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Function to create a Google Meet event using Google Calendar API
async function createGoogleMeet(params: {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
}): Promise<string> {
  const { title, description, startTime, endTime } = params;

  // Read Service Account data from env
  const privateKeyRaw = Deno.env.get("GOOGLE_PRIVATE_KEY");
  const clientEmail = Deno.env.get("GOOGLE_CLIENT_EMAIL");
  if (!privateKeyRaw || !clientEmail) {
    throw new Error("Missing GOOGLE_PRIVATE_KEY or GOOGLE_CLIENT_EMAIL env variables");
  }

  // Replace \n with actual newlines
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  // Prepare JWT token for Google OAuth2
  const iat = getNumericDate(0);
  const exp = getNumericDate(3600);

  const header: Header = { alg: "RS256", typ: "JWT" };

  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    exp,
    iat,
  };

  // Helper function to convert string to Uint8Array
  function str2ab(str: string): Uint8Array {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0; i < str.length; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return bufView;
  }

  // Import private key for signing
  const key = await crypto.subtle.importKey(
    "pkcs8",
    str2ab(atob(privateKey.replace(/-----.*PRIVATE KEY-----/g, "").replace(/\n/g, ""))),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  // Create JWT
  const jwt = await create(header, payload, key);

  // Get OAuth2 access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const err = await tokenResponse.text();
    throw new Error(`Failed to get access token: ${err}`);
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;
  if (!accessToken) throw new Error("No access token returned from Google");

  // Create Google Calendar event with Meet link
  const event = {
    summary: title,
    description,
    start: { dateTime: startTime },
    end: { dateTime: endTime },
    conferenceData: {
      createRequest: {
        requestId: crypto.randomUUID(),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const calendarId = "primary"; // Or some other calendar

  const createEventResponse = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!createEventResponse.ok) {
    const err = await createEventResponse.text();
    throw new Error(`Failed to create calendar event: ${err}`);
  }

  const eventData = await createEventResponse.json();

  // Extract Google Meet link
  const meetLink = eventData.conferenceData?.entryPoints?.find(
    (ep: any) => ep.entryPointType === "video"
  )?.uri;

  if (!meetLink) throw new Error("Google Meet link not found in event response");

  return meetLink;
}

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