import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { initializeApp, cert, getApps } from "npm:firebase-admin/app";
import { getFirestore } from "npm:firebase-admin/firestore";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
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
    // Initialize Firebase Admin SDK if not already initialized
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId: Deno.env.get("FIREBASE_PROJECT_ID"),
          clientEmail: Deno.env.get("FIREBASE_CLIENT_EMAIL"),
          privateKey: Deno.env.get("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, "\n"),
        }),
      });
    }

    // Get Firestore instance
    const db = getFirestore();

    // Parse request body
    const { userId, subscription, ...otherData }: SyncRequest = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Syncing user ${userId} to Firebase`);
    console.log(`Subscription data:`, subscription);
    console.log(`Other data:`, otherData);

    // Prepare data for Firestore update
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    // Add subscription data if provided
    if (subscription) {
      updateData.subscription = {
        status: subscription.status,
        eventsQuota: subscription.eventsQuota,
        eventsUsed: subscription.eventsUsed,
      };

      if (subscription.trialEndsAt) {
        updateData.subscription.trialEndsAt = new Date(subscription.trialEndsAt);
      }
    }

    // Add other data fields
    if (otherData.stripe_customer_id) {
      updateData.stripe_customer_id = otherData.stripe_customer_id;
    }
    
    if (otherData.stripe_subscription_id) {
      updateData.stripe_subscription_id = otherData.stripe_subscription_id;
    }
    
    if (otherData.stripe_subscription_status) {
      updateData.stripe_subscription_status = otherData.stripe_subscription_status;
    }
    
    if (otherData.stripe_current_period_end) {
      updateData.stripe_current_period_end = new Date(otherData.stripe_current_period_end);
    }

    // Update Firestore document
    await db.collection("users").doc(userId).update(updateData);

    console.log(`Successfully updated Firestore document for user ${userId}`);

    return new Response(
      JSON.stringify({ success: true, message: "User data synced to Firebase" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error syncing to Firebase:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to sync data to Firebase",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});