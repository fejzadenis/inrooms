import { create, getNumericDate, Header } from "https://deno.land/x/djwt@v2.8/mod.ts";

interface MeetingParams {
  title: string;
  description?: string;
  startTime: string; // ISO 8601 формат, нпр. "2025-07-10T12:00:00Z"
  endTime: string;
}

async function createGoogleMeet(params: MeetingParams): Promise<string> {
  const { title, description = "", startTime, endTime } = params;

  // Читање Service Account података из env
  const privateKeyRaw = Deno.env.get("GOOGLE_PRIVATE_KEY");
  const clientEmail = Deno.env.get("GOOGLE_CLIENT_EMAIL");
  if (!privateKeyRaw || !clientEmail) throw new Error("Missing GOOGLE_PRIVATE_KEY or GOOGLE_CLIENT_EMAIL env variables");

  // Замењујемо \n са стварним новим редом
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  // Припрема JWT токена за Google OAuth2
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

  // Упомоћна функција да претвори стринг у Uint8Array
  function str2ab(str: string): Uint8Array {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0; i < str.length; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return bufView;
  }

  // Импортујемо приватни кључ за потпис
  const key = await crypto.subtle.importKey(
    "pkcs8",
    str2ab(atob(privateKey.replace(/-----.*PRIVATE KEY-----/g, "").replace(/\n/g, ""))),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  // Креирамо JWT
  const jwt = await create(header, payload, key);

  // Узимамо OAuth2 access token
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

  // Креирање Google Calendar догађаја са Meet линком
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

  const calendarId = "primary"; // Или неки други календар

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

  // Извлачимо Google Meet линк
  const meetLink = eventData.conferenceData?.entryPoints?.find(
    (ep: any) => ep.entryPointType === "video"
  )?.uri;

  if (!meetLink) throw new Error("Google Meet link not found in event response");

  return meetLink;
}
