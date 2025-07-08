import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface CheckoutRequest {
  userId: string;
  userEmail: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  addOns?: string[];
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { userId, userEmail, priceId, successUrl, cancelUrl, metadata = {}, addOns = [] }: CheckoutRequest = await req.json();

    if (!userId || !userEmail || !priceId || !successUrl || !cancelUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Creating checkout session for user ${userId} (${userEmail}) with price ${priceId}`);

    // Verify user exists
    const { data: userData, error: userError } = await supabaseClient
      .from("users")
      .select("id, email, stripe_customer_id")
      .eq("id", userId)
      .single();
      
    if (userError) {
      console.error("Error fetching user:", userError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare line items for checkout
    const lineItems = [
      {
        price: priceId,
        quantity: 1,
      },
    ];

    // Add any selected add-ons
    for (const addOnPriceId of addOns) {
      lineItems.push({
        price: addOnPriceId,
        quantity: 1,
      });
    }

    // Create or retrieve customer
    let customerId: string;
    
    // If user already has a customer ID, use it
    if (userData?.stripe_customer_id) {
      customerId = userData.stripe_customer_id;
      console.log(`Using existing customer ID: ${customerId}`);
      
      // Update customer email if it has changed
      if (userEmail !== userData.email) {
        await stripe.customers.update(customerId, {
          email: userEmail,
        });
        console.log(`Updated customer email to ${userEmail}`);
      }
    } else {
      // Create a new customer
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          user_id: userId,
        },
      });
      customerId = customer.id;
      console.log(`Created new customer: ${customerId}`);
      
      // Store customer ID in database
      const { error: updateError } = await supabaseClient
        .from("users")
        .update({ 
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);
        
      if (updateError) {
        console.error("Error updating user with customer ID:", updateError);
      }
      
      // Also store in stripe_customers table
      const { error: customerError } = await supabaseClient
        .from("stripe_customers")
        .insert({
          id: customerId,
          user_id: userId,
          email: userEmail,
          name: "", // Will be updated by Stripe after checkout
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {
            source: "create-checkout-session"
          }
        });
        
      if (customerError) {
        console.error("Error storing customer record:", customerError);
      }
    }

    // Combine metadata with user info
    const sessionMetadata = {
      user_id: userId,
      user_email: userEmail,
      ...metadata,
    };

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: userId,
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: sessionMetadata,
      subscription_data: {
        metadata: sessionMetadata,
      },
      allow_promotion_codes: true,
      billing_address_collection: "required",
      customer_update: {
        address: "auto",
        name: "auto",
      },
    });

    // Store checkout session in database
    const { error: sessionError } = await supabaseClient
      .from("stripe_checkout_sessions")
      .insert({
        id: session.id,
        user_id: userId,
        customer_id: customerId,
        price_id: priceId,
        status: "created",
        metadata: sessionMetadata,
        success_url: successUrl,
        cancel_url: cancelUrl,
        created_at: new Date().toISOString()
      });
      
    if (sessionError) {
      console.error("Error storing checkout session:", sessionError);
    }

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});