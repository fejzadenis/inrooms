import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface RequestBody {
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

    const { paymentMethodId }: RequestBody = await req.json();

    if (!paymentMethodId) {
      return new Response(
        JSON.stringify({ error: "Payment method ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if this is a default payment method
    const { data: paymentMethod, error: fetchError } = await supabaseClient
      .from("stripe_payment_methods")
      .select("customer_id, is_default")
      .eq("id", paymentMethodId)
      .single();

    if (fetchError) {
      console.error("Error fetching payment method:", fetchError);
      return new Response(
        JSON.stringify({ 
          error: "Database error",
          details: fetchError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Detach payment method from customer in Stripe
    await stripe.paymentMethods.detach(paymentMethodId);

    // Delete payment method from database
    const { error: deleteError } = await supabaseClient
      .from("stripe_payment_methods")
      .delete()
      .eq("id", paymentMethodId);

    if (deleteError) {
      console.error("Error deleting payment method from database:", deleteError);
      return new Response(
        JSON.stringify({ 
          error: "Database error",
          details: deleteError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // If this was a default payment method, update customer
    if (paymentMethod.is_default) {
      // Update customer in database
      await supabaseClient
        .from("stripe_customers")
        .update({
          default_payment_method: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentMethod.customer_id);

      // Find another payment method to set as default
      const { data: otherPaymentMethods } = await supabaseClient
        .from("stripe_payment_methods")
        .select("id")
        .eq("customer_id", paymentMethod.customer_id)
        .limit(1);

      if (otherPaymentMethods && otherPaymentMethods.length > 0) {
        // Set another payment method as default
        const newDefaultId = otherPaymentMethods[0].id;
        
        await supabaseClient
          .from("stripe_payment_methods")
          .update({ is_default: true })
          .eq("id", newDefaultId);
          
        await supabaseClient
          .from("stripe_customers")
          .update({
            default_payment_method: newDefaultId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", paymentMethod.customer_id);
          
        // Update in Stripe too
        await stripe.customers.update(paymentMethod.customer_id, {
          invoice_settings: {
            default_payment_method: newDefaultId,
          },
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment method deleted successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error deleting payment method:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to delete payment method",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});