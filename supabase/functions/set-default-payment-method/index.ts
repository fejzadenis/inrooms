import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface RequestBody {
  customerId: string;
  paymentMethodId: string;
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
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { customerId, paymentMethodId }: RequestBody = await req.json();

    if (!customerId || !paymentMethodId) {
      return new Response(
        JSON.stringify({ error: "Customer ID and payment method ID are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Set as default payment method in Stripe
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Update in database
    const { error } = await supabaseClient
      .from("stripe_customers")
      .update({
        default_payment_method: paymentMethodId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerId);

    if (error) {
      console.error("Error updating default payment method in database:", error);
      return new Response(
        JSON.stringify({ 
          error: "Database error",
          details: error.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update is_default flag on payment methods
    await supabaseClient
      .from("stripe_payment_methods")
      .update({ is_default: false })
      .eq("customer_id", customerId);

    await supabaseClient
      .from("stripe_payment_methods")
      .update({ is_default: true })
      .eq("id", paymentMethodId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Default payment method updated successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error setting default payment method:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to set default payment method",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});