import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Define the expected request structure
interface QuoteRequest {
  companyName: string
  contactName: string
  email: string
  phone?: string
  teamSize: string
  requirements: string
  timeline: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false
        }
      }
    )

    const quoteData: QuoteRequest = await req.json()

    // Validate required fields
    if (!quoteData.companyName || !quoteData.contactName || !quoteData.email || 
        !quoteData.teamSize || !quoteData.requirements || !quoteData.timeline) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Store quote request in database
    try {
      const { data, error } = await supabaseClient
        .from('custom_quotes')
        .insert([
          {
            company_name: quoteData.companyName,
            contact_name: quoteData.contactName,
            email: quoteData.email,
            phone: quoteData.phone,
            team_size: quoteData.teamSize,
            requirements: quoteData.requirements,
            timeline: quoteData.timeline,
            status: 'pending',
            created_at: new Date().toISOString(),
          }
        ])
        .select()

      if (error) {
        console.error('Error storing quote request:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to store quote request', details: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      // Send notification email to sales team (you can integrate with your email service)
      await sendQuoteNotification(quoteData)
  
      // Send confirmation email to customer
      await sendCustomerConfirmation(quoteData)
  
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Quote request submitted successfully',
          requestId: data?.[0]?.id 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } catch (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Database error', details: dbError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Error processing quote request:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function sendQuoteNotification(quoteData: QuoteRequest) {
  // Integrate with your email service (SendGrid, Resend, etc.)
  // For now, just log the notification
  console.log('New quote request received:', {
    company: quoteData.companyName,
    contact: quoteData.contactName,
    email: quoteData.email,
    teamSize: quoteData.teamSize,
    timeline: quoteData.timeline
  })
}

async function sendCustomerConfirmation(quoteData: QuoteRequest) {
  // Send confirmation email to customer
  console.log(`Sending confirmation email to ${quoteData.email}`)
}