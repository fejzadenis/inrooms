import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey"
};

serve(async (req) => {
  console.log(`[${new Date().toISOString()}] Incoming request: ${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log(`[${new Date().toISOString()}] Handling CORS preflight request`);
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const bodyText = await req.text();
    console.log(`[${new Date().toISOString()}] Request body: ${bodyText}`);

    const { title, description = "", startTime, endTime } = JSON.parse(bodyText);

    // Validate required fields
    if (!title || !startTime || !endTime) {
      console.warn(`[${new Date().toISOString()}] Validation failed: Missing required fields. title: ${title}, startTime: ${startTime}, endTime: ${endTime}`);
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[${new Date().toISOString()}] Validation passed. Title: "${title}", Start: "${startTime}", End: "${endTime}"`);

    // Get environment variables
    const privateKeyRaw = Deno.env.get("GOOGLE_PRIVATE_KEY");
    const clientEmail = Deno.env.get("GOOGLE_CLIENT_EMAIL");

    if (!privateKeyRaw || !clientEmail) {
      console.error(`[${new Date().toISOString()}] Missing Google API credentials in environment variables`);
      return new Response(
        JSON.stringify({
          error: "Server configuration error",
          details: "Google API credentials not configured",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[${new Date().toISOString()}] Environment variables loaded. Starting to create Google Meet event...`);

    try {
      // Create a real Google Meet link
      const meetLink = await createGoogleMeet({
        title,
        description,
        startTime: typeof startTime === "string" ? startTime : startTime.toISOString(),
        endTime: typeof endTime === "string" ? endTime : endTime.toISOString(),
      });

      console.log(`[${new Date().toISOString()}] Google Meet event created successfully: ${meetLink}`);

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
      console.error(`[${new Date().toISOString()}] Error creating Google Meet event:`, googleError);

      // If Google API fails, fall back to a mock link for development
      if (Deno.env.get("ENVIRONMENT") === "development") {
        const mockMeetLink = `https://meet.google.com/${generateMeetingId()}`;
        console.log(`[${new Date().toISOString()}] Using mock Meet link for development: ${mockMeetLink}`);

        return new Response(
          JSON.stringify({
            success: true,
            meetLink: mockMeetLink,
            title,
            description,
            startTime,
            endTime,
            mock: true,
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
    console.error(`[${new Date().toISOString()}] Error processing request:`, error);
    return new Response(
      JSON.stringify({
        error: "Failed to create meeting",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Function to create a Google Meet event using Google Calendar API
async function createGoogleMeet(params) {
  const { title, description, startTime, endTime } = params;

  console.log(`[${new Date().toISOString()}] createGoogleMeet called with title: "${title}"`);

  const privateKeyRaw = Deno.env.get("GOOGLE_PRIVATE_KEY");
  const clientEmail = Deno.env.get("GOOGLE_CLIENT_EMAIL");

  if (!privateKeyRaw || !clientEmail) {
    throw new Error("Missing GOOGLE_PRIVATE_KEY or GOOGLE_CLIENT_EMAIL env variables");
  }

  // Replace \n with actual newlines in private key
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  console.log(`[${new Date().toISOString()}] Preparing JWT token`);

  const iat = getNumericDate(0);
  const exp = getNumericDate(3600);
  const header = {
    alg: "RS256",
    typ: "JWT",
  };
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    exp,
    iat,
  };

  function str2ab(str) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0; i < str.length; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return bufView;
  }

  // Remove header/footer and newlines before base64 decode
  const keyData = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\n/g, "");

  const keyUint8 = str2ab(atob(keyData));

  console.log(`[${new Date().toISOString()}] Importing private key for signing JWT`);

  const key = await crypto.subtle.importKey(
    "pkcs8",
    keyUint8,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  console.log(`[${new Date().toISOString()}] Creating JWT`);

  const jwt = await create(header, payload, key);

  console.log(`[${new Date().toISOString()}] Requesting OAuth2 access token`);

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const err = await tokenResponse.text();
    console.error(`[${new Date().toISOString()}] Failed to get access token: ${err}`);
    throw new Error(`Failed to get access token: ${err}`);
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    throw new Error("No access token returned from Google");
  }

  console.log(`[${new Date().toISOString()}] Access token received, creating calendar event`);

  const event = {
    summary: title,
    description,
    start: {
      dateTime: startTime,
    },
    end: {
      dateTime: endTime,
    },
    conferenceData: {
      createRequest: {
        requestId: crypto.randomUUID(),
        conferenceSolutionKey: {
          type: "eventHangout",
        },
      },
    },
  };

  const calendarId = "primary";

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
    console.error(`[${new Date().toISOString()}] Failed to create calendar event: ${err}`);
    throw new Error(`Failed to create calendar event: ${err}`);
  }

  const eventData = await createEventResponse.json();

  const meetLink = eventData.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === "video")?.uri;

  if (!meetLink) {
    throw new Error("Google Meet link not found in event response");
  }

  console.log(`[${new Date().toISOString()}] Google Meet link extracted: ${meetLink}`);

  return meetLink;
}

// Generate a random meeting ID similar to Google Meet format
function generateMeetingId() {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const allChars = chars + numbers;

  // Format: abc-defg-hij
  let id = "";

  for (let i = 0; i < 3; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  id += "-";

  for (let i = 0; i < 4; i++) {
    id += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  id += "-";

  for (let i = 0; i < 3; i++) {
    id += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  return id;
}
