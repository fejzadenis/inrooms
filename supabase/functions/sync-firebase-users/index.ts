import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { initializeApp, cert, getApps } from "npm:firebase-admin/app";
import { getFirestore } from "npm:firebase-admin/firestore";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // This function is now deprecated as we're updating Firebase directly from the webhook
  return new Response(
    JSON.stringify({ 
      message: "This function is deprecated. Firebase is now updated directly from the Stripe webhook.",
      status: "deprecated"
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );

  try {
    // Initialize Supabase client with service role key for admin access
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

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

    // Get all users that need Firebase sync
    const { data: usersToSync, error: usersError } = await supabaseClient
      .from("users")
      .select("id")
      .eq("needs_firebase_sync", true)
      .order("firebase_sync_requested_at", { ascending: true })
      .limit(10); // Process in batches

    if (usersError) {
      console.error("Error fetching users to sync:", usersError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch users to sync", 
          details: usersError.message 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!usersToSync || usersToSync.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users need syncing" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Found ${usersToSync.length} users that need syncing`);

    // Process each user
    const results = await Promise.all(
      usersToSync.map(async (user) => {
        try {
          // Get full user data
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
            .eq("id", user.id)
            .single();

          if (userError || !userData) {
            console.error(`Error fetching data for user ${user.id}:`, userError);
            return { 
              userId: user.id, 
              success: false, 
              error: userError?.message || "User data not found" 
            };
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
            console.log(`Syncing data to Firebase for user ${user.id}`);
            await firestore.collection('users').doc(user.id).update(firebaseData);
            console.log(`Successfully synced user ${user.id} to Firebase`);
          } catch (firestoreError) {
            console.error(`Error updating Firestore for user ${user.id}:`, firestoreError);
            return { 
              userId: user.id, 
              success: false, 
              error: firestoreError instanceof Error ? firestoreError.message : "Firestore update failed" 
            };
          }
          console.log("Subscription status:", userData.subscription_status);
          console.log("Events quota:", userData.subscription_events_quota);
          console.log("Events used:", userData.subscription_events_used);

          // Mark the user as synced
          const { error: updateError } = await supabaseClient
            .from("users")
            .update({
              needs_firebase_sync: false,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

          if (updateError) {
            console.error(`Error updating sync status for user ${user.id}:`, updateError);
            return { 
              userId: user.id, 
              success: false, 
              error: updateError.message 
            };
          }

          return { userId: user.id, success: true };
        } catch (error) {
          console.error(`Error processing user ${user.id}:`, error);
          return { 
            userId: user.id, 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown error" 
          };
        }
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
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