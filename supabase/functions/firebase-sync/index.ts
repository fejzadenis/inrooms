import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { initializeApp, cert, getApps } from "npm:firebase-admin/app";
import { getFirestore } from "npm:firebase-admin/firestore";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
};

interface SyncRequest {
  userId: string;
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
    // Initialize Supabase client with service role key for admin access
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse request body
    const { userId }: SyncRequest = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Firebase Admin SDK if not already initialized
    if (getApps().length === 0) {
      try {
        // Get Firebase service account from environment variables
        const serviceAccountStr = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
        if (!serviceAccountStr) {
          throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set");
        }
        
        const serviceAccount = JSON.parse(serviceAccountStr);
        
        initializeApp({
          credential: cert(serviceAccount)
        });
        
        console.log("Firebase Admin SDK initialized successfully");
      } catch (initError) {
        console.error("Error initializing Firebase Admin SDK:", initError);
        return new Response(
          JSON.stringify({ 
            error: "Failed to initialize Firebase", 
            details: initError instanceof Error ? initError.message : "Unknown error" 
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }
    
    // Get Firestore instance
    const firestore = getFirestore();

    // Get user data from Supabase
    const { data: userData, error: userError } = await supabaseClient
      .from("users")
      .select(`
        id, 
        email, 
        name, 
        role,
        subscription_status,
        subscription_events_quota,
        subscription_events_used,
        subscription_trial_ends_at,
        stripe_customer_id,
        stripe_subscription_id,
        stripe_subscription_status,
        stripe_current_period_end
      `)
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch user data", 
          details: userError.message 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!userData) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare data for Firebase
    const firebaseData = {
      subscription: {
        status: userData.subscription_status || 'inactive',
        eventsQuota: userData.subscription_events_quota || 0,
        eventsUsed: userData.subscription_events_used || 0,
        trialEndsAt: userData.subscription_trial_ends_at || null
      },
      stripe_customer_id: userData.stripe_customer_id || null,
      stripe_subscription_id: userData.stripe_subscription_id || null,
      stripe_subscription_status: userData.stripe_subscription_status || null,
      stripe_current_period_end: userData.stripe_current_period_end || null,
      updatedAt: new Date()
    };

    // Update Firestore document
    try {
      console.log(`Syncing data to Firebase for user ${userId}`);
      await firestore.collection('users').doc(userId).update(firebaseData);
      console.log(`Successfully synced user ${userId} to Firebase`);
    } catch (firestoreError) {
      console.error(`Error updating Firestore for user ${userId}:`, firestoreError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to update Firestore", 
          details: firestoreError instanceof Error ? firestoreError.message : "Unknown error" 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    console.log("Stripe subscription status:", userData.stripe_subscription_status);
    console.log("Stripe current period end:", userData.stripe_current_period_end);

    // Mark the user as synced in Supabase
    const { error: updateError } = await supabaseClient
      .from("users")
      .update({
        needs_firebase_sync: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating user sync status:", updateError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to update user sync status", 
          details: updateError.message 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "User data synced to Firebase successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});