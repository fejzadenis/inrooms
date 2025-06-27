// Follow Deno and Supabase Edge Function conventions
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Parse request body
    const quoteData = await req.json();

    // Validate required fields
    const requiredFields = ['companyName', 'contactName', 'email', 'teamSize', 'requirements', 'timeline'];
    for (const field of requiredFields) {
      if (!quoteData[field]) {
        return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // Store the quote request in Supabase
    const { data, error } = await supabase
      .from('custom_quotes')
      .insert([
        {
          company_name: quoteData.companyName,
          contact_name: quoteData.contactName,
          email: quoteData.email,
          phone: quoteData.phone || null,
          team_size: quoteData.teamSize,
          requirements: quoteData.requirements,
          timeline: quoteData.timeline,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('Error storing quote request:', error);
      return new Response(JSON.stringify({ error: 'Failed to store quote request' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // In a real application, you would also send an email notification to your sales team
    // and potentially to the customer as well

    // Return success response
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Quote request submitted successfully',
      quoteId: data[0].id
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error processing quote request:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});