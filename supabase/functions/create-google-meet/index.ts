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
    const adminEmail = Deno.env.get('GOOGLE_ADMIN_EMAIL') // Optional: for domain-wide delegation

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

    // Simply unescape newlines
    privateKey = privateKey.replace(/\\n/g, '\n')

    console.log('Configuring Google service account for calendar access')

    // Configure auth with proper scopes and subject if needed
    const authConfig = {
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ],
    }

    // If admin email is provided, use domain-wide delegation
    if (adminEmail) {
      authConfig.subject = adminEmail
    }

    const auth = new google.auth.GoogleAuth(authConfig)
    const calendar = google.calendar({ version: 'v3', auth })

    // Determine which calendar to use
    let calendarId = 'primary'
    
    // If using domain-wide delegation, use the admin's primary calendar
    if (adminEmail) {
      calendarId = adminEmail
    }

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

    console.log('Creating Google Calendar event with Meet link...', {
      calendarId,
      hasAdminEmail: !!adminEmail,
      eventSummary: title
    })
    
    try {
      const response = await calendar.events.insert({
        calendarId: calendarId,
        conferenceDataVersion: 1,
        requestBody: event,
      })

      console.log('Google Calendar event created successfully', {
        eventId: response.data.id,
        meetLink: response.data.hangoutLink
      })

      return new Response(
        JSON.stringify({
          meetLink: response.data.hangoutLink || response.data.conferenceData?.entryPoints?.[0]?.uri,
          eventId: response.data.id,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      )
    } catch (calendarError) {
      console.error('Calendar API error details:', {
        status: calendarError.code,
        message: calendarError.message,
        errors: calendarError.errors,
        calendarId
      })
      
      // If primary calendar fails and we're not using domain delegation, try creating without Meet link
      if (calendarError.code === 400 && !adminEmail) {
        console.log('Attempting to create event without Google Meet integration...')
        
        const simpleEvent = {
          summary: title,
          description: description + '\n\nNote: Google Meet link could not be generated automatically.',
          start: {
            dateTime: new Date(startTime).toISOString(),
            timeZone: 'UTC'
          },
          end: {
            dateTime: new Date(endTime).toISOString(),
            timeZone: 'UTC'
          }
        }
        
        const fallbackResponse = await calendar.events.insert({
          calendarId: clientEmail, // Use service account email as calendar ID
          requestBody: simpleEvent,
        })
        
        // Generate a placeholder meet link or use a generic one
        const fallbackMeetLink = `https://meet.google.com/new`
        
        return new Response(
          JSON.stringify({
            meetLink: fallbackMeetLink,
            eventId: fallbackResponse.data.id,
            note: 'Event created without automatic Google Meet integration'
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        )
      }
      
      throw calendarError
    }

  } catch (error) {
    console.error('Error creating Google Meet event:', error)
    
    // Provide more detailed error information
    let errorMessage = 'Failed to create Google Meet event'
    let errorDetails = error.message || 'Unknown error'
    
    if (error.code) {
      errorDetails = `Google API Error (${error.code}): ${error.message}`
    }
    
    // Check for specific error types
    if (error.message?.includes('insufficient permissions')) {
      errorDetails = 'Service account lacks calendar permissions. Please ensure the service account has Calendar API access.'
    } else if (error.message?.includes('not found')) {
      errorDetails = 'Calendar not found. Please check the calendar ID or service account configuration.'
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