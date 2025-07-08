// Import required dependencies
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Define the expected request structure
interface SyncRequest {
  userId: string;
  subscription?: {
    status: string;
    eventsQuota: number;
    eventsUsed: number;
    trialEndsAt?: string;
  };
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_subscription_status?: string;
  stripe_current_period_end?: string;
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
    // Initialize Firebase Admin SDK
    const { initializeApp, cert } = await import("npm:firebase-admin/app");
    const { getFirestore } = await import("npm:firebase-admin/firestore");
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials not configured");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { userId, subscription, ...stripeData }: SyncRequest = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Processing sync request for user ${userId}`);
    console.log("Subscription data:", subscription);
    console.log("Stripe data:", stripeData);

    // Get service account from environment variable
    const serviceAccount = JSON.parse(Deno.env.get("FIREBASE_SERVICE_ACCOUNT") || "{}");
    
    if (!serviceAccount.project_id) {
      throw new Error("Firebase service account not configured");
    }

    // Check if app is already initialized
    let app;
    try {
      const admin = await import("npm:firebase-admin");
      app = admin.apps.length ? admin.apps[0] : null;
    } catch (e) {
      console.log("Firebase admin not initialized yet");
    }

    if (!app) {
      app = initializeApp({
        credential: cert(serviceAccount),
      });
    }

    const db = getFirestore();
    
    // Get current user data from Firestore
    const userDoc = await db.collection("users").doc(userId).get();
    
    if (!userDoc.exists) {
      console.log(`User ${userId} not found in Firestore`);
      
      // Get user data from Supabase
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();
        
      if (userError) {
        throw new Error(`User not found in Supabase: ${userError.message}`);
      }
      
      // Create user in Firestore
      await db.collection("users").doc(userId).set({
        uid: userId,
        email: userData.email,
        displayName: userData.name,
        photoURL: userData.photo_url,
        emailVerified: userData.email_verified || false,
        subscription: subscription || {
          status: userData.subscription_status || "inactive",
          eventsQuota: userData.subscription_events_quota || 0,
          eventsUsed: userData.subscription_events_used || 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log(`Created new user ${userId} in Firestore`);
    } else {
      // Update existing user in Firestore
      const updateData: Record<string, any> = {
        updatedAt: new Date(),
      };
      
      if (subscription) {
        updateData.subscription = subscription;
      }
      
      if (stripeData.stripe_customer_id) {
        updateData.stripeCustomerId = stripeData.stripe_customer_id;
      }
      
      if (stripeData.stripe_subscription_id) {
        updateData.stripeSubscriptionId = stripeData.stripe_subscription_id;
      }
      
      if (stripeData.stripe_subscription_status) {
        updateData.stripeSubscriptionStatus = stripeData.stripe_subscription_status;
      }
      
      if (stripeData.stripe_current_period_end) {
        updateData.stripeCurrentPeriodEnd = new Date(stripeData.stripe_current_period_end);
      }
      
      await db.collection("users").doc(userId).update(updateData);
      
      console.log(`Updated user ${userId} in Firestore with:`, updateData);
    }
    
    // Mark user as synced in Supabase
    const { error: updateError } = await supabase
      .from("users")
      .update({
        needs_firebase_sync: false,
        firebase_sync_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
      
    if (updateError) {
      console.error("Error updating sync status in Supabase:", updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `User ${userId} synced to Firebase successfully` 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error syncing to Firebase:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to sync to Firebase", 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});