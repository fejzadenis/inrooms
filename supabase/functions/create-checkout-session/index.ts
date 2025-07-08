import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface RequestBody {
  userId: string;
  userEmail: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  addOns?: string[];
  metadata?: Record<string, string>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Stripe with the secret key
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { 
      userId, 
      userEmail, 
      priceId, 
      successUrl, 
      cancelUrl, 
      addOns = [],
      metadata = {}
    }: RequestBody = await req.json()

    // Validate required fields
    if (!userId || !userEmail || !priceId || !successUrl || !cancelUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Creating checkout session for user ${userId} with price ${priceId}`)

    // Check if user exists in Supabase
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('id, email, stripe_customer_id')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get or create Stripe customer
    let customerId = userData.stripe_customer_id

    if (!customerId) {
      console.log(`No existing Stripe customer for user ${userId}, creating new customer`)
      
      // Create a new customer in Stripe
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          supabase_user_id: userId
        }
      })
      
      customerId = customer.id
      
      // Update user with customer ID
      await supabaseClient
        .from('users')
        .update({ 
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        
      console.log(`Created new Stripe customer ${customerId} for user ${userId}`)
      
      // Also store in stripe_customers table
      await supabaseClient
        .from('stripe_customers')
        .insert({
          id: customerId,
          user_id: userId,
          email: userEmail,
          created_at: new Date().toISOString()
        })
    } else {
      console.log(`Using existing Stripe customer ${customerId} for user ${userId}`)
    }

    // Prepare line items for checkout
    const lineItems = [
      {
        price: priceId,
        quantity: 1,
      }
    ]

    // Add any selected add-ons
    for (const addOnPriceId of addOns) {
      lineItems.push({
        price: addOnPriceId,
        quantity: 1,
      })
    }

    // Combine metadata
    const sessionMetadata = {
      user_id: userId,
      ...metadata
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: sessionMetadata,
      subscription_data: {
        metadata: sessionMetadata,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
    })

    // Store checkout session in database
    await supabaseClient
      .from('stripe_checkout_sessions')
      .insert({
        id: session.id,
        user_id: userId,
        customer_id: customerId,
        price_id: priceId,
        status: 'created',
        metadata: sessionMetadata,
        success_url: successUrl,
        cancel_url: cancelUrl,
        created_at: new Date().toISOString()
      })

    console.log(`Created checkout session ${session.id} for user ${userId}`)

    return new Response(
      JSON.stringify({ 
        sessionId: session.id, 
        url: session.url || ''
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error creating checkout session:', error)
    
    return new Response(
      JSON.stringify({
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})