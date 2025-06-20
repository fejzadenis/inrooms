import { google } from "npm:googleapis@128.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { title, description, startTime, endTime } = await req.json()

    // Check for required environment variables
    const clientEmail = Deno.env.get('GOOGLE_CLIENT_EMAIL')
    let privateKey = Deno.env.get('GOOGLE_PRIVATE_KEY')

    if (!clientEmail || !privateKey) {
      console.error('Missing Google credentials:', { 
        hasClientEmail: !!clientEmail, 
        hasPrivateKey: !!privateKey 
      })
      return new Response(
        JSON.stringify({ 
          error: 'Google service account credentials not configured',
          details: 'Missing GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY environment variables'
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Properly format the private key
    privateKey = privateKey
      .trim()
      .replace(/\\n/g, '\n')
      .replace(/-----BEGIN PRIVATE KEY----- /g, '-----BEGIN PRIVATE KEY-----\n')
      .replace(/ -----END PRIVATE KEY-----/g, '\n-----END PRIVATE KEY-----')
      .replace(/([A-Za-z0-9+/=]{64})/g, '$1\n')
      .replace(/\n\n/g, '\n')
      .trim()

    console.log('Private key first 50 chars:', privateKey.substring(0, 50))
    console.log('Private key last 50 chars:', privateKey.substring(privateKey.length - 50))

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/calendar'],
    })

    const calendar = google.calendar({ version: 'v3', auth })

    const event = {
      summary: title,
      description: description,
      start: {
        dateTime: new Date(startTime).toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: new Date(endTime).toISOString(),
        timeZone: 'UTC'
      },
      conferenceData: {
        createRequest: {
          requestId: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
          conferenceSolutionKey: { type: 'googleMeet' },
        },
      },
    }

    console.log('Creating Google Calendar event with Meet link...')
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: event,
    })

    console.log('Google Calendar event created successfully')

    return new Response(
      JSON.stringify({
        meetLink: response.data.hangoutLink,
        eventId: response.data.id,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Error creating Google Meet event:', error)
    
    // Provide more detailed error information
    let errorMessage = 'Failed to create Google Meet event'
    let errorDetails = error.message || 'Unknown error'
    
    if (error.code) {
      errorDetails = `Google API Error (${error.code}): ${error.message}`
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})