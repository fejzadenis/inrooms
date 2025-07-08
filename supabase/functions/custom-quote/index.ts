import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Configure CORS headers
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
  if (req.method === "OPTIONS") {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          persistSession: false
        }
      }
    );

    // Parse request body
    let quoteData: QuoteRequest;
    try {
      quoteData = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate required fields
    if (!quoteData.companyName || !quoteData.contactName || !quoteData.email || 
        !quoteData.teamSize || !quoteData.requirements || !quoteData.timeline) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Store quote request in database
    let quoteId: string | null = null;
    
    try {
      // First try to insert into custom_quotes table
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
            status: 'pending'
          }
        ])
        .select();
      
      if (error) {
        console.error('Error storing in custom_quotes:', error);
        
        // Fallback to quote_requests table if custom_quotes fails
        const fallbackResult = await supabaseClient
          .from('quote_requests')
          .insert([
            {
              company_name: quoteData.companyName,
              contact_name: quoteData.contactName,
              email: quoteData.email,
              phone: quoteData.phone,
              team_size: quoteData.teamSize,
              requirements: quoteData.requirements,
              timeline: quoteData.timeline,
              status: 'pending'
            }
          ])
          .select();
          
        if (fallbackResult.error) {
          throw fallbackResult.error;
        }
        
        quoteId = fallbackResult.data?.[0]?.id;
      } else {
        quoteId = data?.[0]?.id;
      }

      // Send notification email to sales team
      try {
        await sendQuoteNotification(quoteData);
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
        // Continue even if email fails
      }

      // Send confirmation email to customer
      try {
        await sendCustomerConfirmation(quoteData);
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Continue even if email fails
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Quote request submitted successfully',
          requestId: quoteId
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } catch (dbError) {
      console.error('Database error storing quote request:', dbError);
      return new Response(
        JSON.stringify({ 
          error: 'Internal server error',
          requestId: quoteId
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})

async function sendQuoteNotification(quoteData: QuoteRequest) {
  // Integrate with your email service (SendGrid, Resend, etc.)
  // For now, just log the notification to console
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
  console.log(`Sending confirmation email to ${quoteData.email}`);
  
  // In a real implementation, you would use an email service here
  // For example with SendGrid, Resend, or another email provider
}