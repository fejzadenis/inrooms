import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { initializeApp, cert, getApps } from 'npm:firebase-admin/app'
import { getFirestore } from 'npm:firebase-admin/firestore'

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
// Initialize Stripe with the secret key
// Initialize Stripe with the secret key
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16'
});
// Initialize Supabase client
// Initialize Supabase client
const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
const cryptoProvider = Stripe.createSubtleCryptoProvider();
// Log webhook initialization
console.log('Webhook endpoint initialized with:');
console.log(`- Supabase URL: ${Deno.env.get('SUPABASE_URL') ? 'Set' : 'Not set'}`);
console.log(`- Stripe Secret Key: ${Deno.env.get('STRIPE_SECRET_KEY') ? 'Set' : 'Not set'}`)
console.log(`- Webhook Secret: ${Deno.env.get('STRIPE_WEBHOOK_SECRET') ? 'Set' : 'Not set'}`)
console.log(`- Firebase Service Account: ${Deno.env.get('FIREBASE_SERVICE_ACCOUNT') ? 'Set' : 'Not set'}`)

// Initialize Firebase Admin SDK if not already initialized
let firestoreDb;
if (getApps().length === 0) {
  try {
    // Get Firebase service account from environment variables
    const serviceAccountStr = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
    if (!serviceAccountStr) {
      console.error("FIREBASE_SERVICE_ACCOUNT environment variable is not set");
    } else {
      let serviceAccount;
      try {
        // Try parsing as JSON
        serviceAccount = JSON.parse(serviceAccountStr);
      } catch (parseError) {
        console.error("Error parsing service account JSON:", parseError);
        try {
          // Try decoding from base64 if JSON parsing fails
          const decoded = atob(serviceAccountStr);
          serviceAccount = JSON.parse(decoded);
          console.log("Successfully parsed service account from base64");
        } catch (decodeError) {
          console.error("Error decoding base64 service account:", decodeError);
          throw new Error("Could not parse Firebase service account");
        }
      }
      
      initializeApp({
        credential: cert(serviceAccount)
      });
      
      firestoreDb = getFirestore();
      console.log("Firebase Admin SDK initialized successfully");
    }
  } catch (initError) {
    console.error("Error initializing Firebase Admin SDK:", initError);
  }
} else {
  firestoreDb = getFirestore();
  console.log("Using existing Firebase Admin SDK instance");
}

serve(async (request)=>{
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  const signature = request.headers.get('Stripe-Signature');
  const body = await request.text();
  if (!signature) {
    console.error('No Stripe signature found in request headers');
    return new Response(JSON.stringify({
      error: 'No Stripe signature found'
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET environment variable is not set');
    return new Response(JSON.stringify({
      error: 'Webhook secret not configured'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  try {
    console.log(`Attempting to verify webhook signature: ${signature.substring(0, 20)}...`);
    console.log('Webhook endpoint initialized with:');
    console.log(`- Supabase URL: ${Deno.env.get('SUPABASE_URL') ? 'Set' : 'Not set'}`);
    console.log(`- Stripe Secret Key: ${Deno.env.get('STRIPE_SECRET_KEY') ? 'Set' : 'Not set'}`);
    console.log(`- Webhook Secret: ${Deno.env.get('STRIPE_WEBHOOK_SECRET') ? 'Set' : 'Not set'}`);
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret, undefined, cryptoProvider);
    console.log(`✅ Received valid event: ${event.type}`);
    console.log(`Handling ${event.type} event`);

    // Function to update Firestore document
    const updateFirestore = async (userId, data) => {
      if (!firestoreDb) {
        console.error("Firestore not initialized, skipping update");
        return;
      }
      
      try {
        console.log(`Writing user data to Firestore:`, data);
        const userRef = firestoreDb.collection('users').doc(userId);
        await userRef.set(data, { merge: true });
        console.log(`✅ Successfully updated Firestore for user ${userId}`);
      } catch (error) {
        console.error(`❌ Error updating Firestore for user ${userId}:`, error);
      }
    };

    // Update checkout session status if applicable
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      try {
        // Update the checkout session status in the database
        const { error } = await supabaseClient.from('stripe_checkout_sessions').update({ 
          "status": 'completed',
          "completed_at": new Date().toISOString(),
          "subscription_id": session.subscription || null
        }).eq('id', session.id);
        if (error) {
          console.error('Error updating checkout session status:', error);
        } else {
          console.log(`Updated checkout session ${session.id} status to completed`);
        }
      } catch (updateError) {
        console.error('Error updating checkout session:', updateError);
      }
    }
    switch(event.type){
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.created':
        await handleCustomerCreated(event.data.object);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'payment_method.attached':
        await handlePaymentMethodAttached(event.data.object);
        break;
      case 'payment_method.detached':
        await handlePaymentMethodDetached(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    return new Response(JSON.stringify({
      received: true,
      event: event.type
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return new Response(JSON.stringify({
      error: 'Webhook error',
      message: error.message
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
async function handleCheckoutCompleted(session) {
  // Try to get userId from client_reference_id first, then fallback to metadata
  let userId = session.client_reference_id || session.metadata?.user_id;
  
  console.log('Handling checkout.session.completed event');
  console.log(`- Session ID: ${session.id}`);
  console.log(`- Client Reference ID: ${session.client_reference_id || 'Not set'}`);
  console.log(`- Metadata:`, session.metadata);
  console.log(`- Customer: ${session.customer || 'Not set'}`);
  console.log(`- Customer Email: ${session.customer_details?.email || 'Not set'}`);
  console.log(`- Subscription: ${session.subscription || 'Not set'}`);
  if (!userId) {
    console.error('No user_id in session client_reference_id or metadata, attempting to find from email');
    // Try to find user by email first (most reliable method)
    if (session.customer_details?.email) {
      try {
        console.log(`Looking up user by email: ${session.customer_details.email}`);
        const { data: userByEmail } = await supabaseClient.from('users').select('id').eq('email', session.customer_details.email).single();
        if (userByEmail) {
          userId = userByEmail.id;
          console.log(`✅ Found user ${userId} by email lookup`);
        } else {
          console.warn(`No user found with email ${session.customer_details.email}, checking customer record`);
        }
      } catch (emailError) {
        console.error('Error finding user by email:', emailError);
      }
    }
    // Try to get userId from customer if available
    if (!userId && session.customer) {
      try {
        const { data: customerData } = await supabaseClient.from('stripe_customers').select('user_id').eq('id', session.customer).single();
        if (customerData?.user_id) {
          userId = customerData.user_id;
          console.log(`Retrieved user_id ${userId} from customer ${session.customer}`);
        } else {
          console.warn(`No user_id found for customer ${session.customer}`);
        }
      } catch (error) {
        console.error('Error retrieving user_id from customer:', error);
      }
    }
    // If we still don't have a userId, try to create a placeholder from email
    if (!userId && session.customer_details?.email) {
      console.log(`Creating placeholder user ID from email: ${session.customer_details.email}`);
      userId = `placeholder_${Date.now()}`;
    }
    if (!userId) {
      console.error('❌ Could not determine user_id for checkout session');
      console.log(`- Client Reference ID: ${session.client_reference_id ? session.client_reference_id : 'Not set'}`);
      console.log(`- Metadata: ${JSON.stringify(session.metadata || {})}`);
      console.log(`- Customer: ${session.customer ? session.customer : 'Not set'}`);
      console.log(`- Session ID: ${session.id}`);
      return;
    }
  }
  try {
    // Store customer in stripe_customers table if it doesn't exist
    if (session.customer) {
      const { data: existingCustomer1 } = await supabaseClient.from('stripe_customers').select('id').eq('id', session.customer).single();
      if (!existingCustomer1) {
        console.log(`Creating new customer record for ${session.customer} linked to user ${userId}`);
        const { error: customerInsertError } = await supabaseClient.from('stripe_customers').insert({
          id: session.customer,
          user_id: userId,
          email: session.customer_details?.email || '',
          name: session.customer_details?.name || '',
          metadata: {
            checkout_session_id: session.id,
            client_reference_id: session.client_reference_id,
            user_id: userId
          },
          created_at: new Date().toISOString()
        });
        if (customerInsertError) {
          console.error('❌ Error creating customer record:', customerInsertError);
        }
      }
      // Get plan details from subscription if available
      let planDetails = {
        planId: 'default',
        eventsQuota: 0
      };
      if (session.subscription) {
        try { 
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          const priceId = subscription.items.data[0]?.price.id;
          planDetails = getPlanDetailsByPriceId(priceId || '');
        } catch (error) {
          console.error('Error retrieving subscription details:', error);
        }
      }
      // Initialize Firebase Admin SDK if not already initialized
      try {
        // Import Firebase Admin SDK
        const firebaseAdmin = await import('npm:firebase-admin/app');
        const firestoreModule = await import('npm:firebase-admin/firestore');
        
        const { initializeApp, cert, getApps } = firebaseAdmin;
        const { getFirestore } = firestoreModule;
        
        // Check if Firebase Admin SDK is already initialized
        if (getApps().length === 0) {
          // Get Firebase service account from environment variables
          const serviceAccountStr = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
          if (!serviceAccountStr) {
            throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set");
          }
          
          let serviceAccount;
          try {
            // Try to parse the service account JSON
            serviceAccount = JSON.parse(serviceAccountStr);
            console.log("Successfully parsed service account JSON");
          } catch (parseError) {
            // If parsing fails, try to decode from base64
            try {
              const decoded = atob(serviceAccountStr);
              serviceAccount = JSON.parse(decoded);
              console.log("Successfully parsed base64-encoded service account JSON");
            } catch (decodeError) {
              console.error("Failed to parse service account JSON:", parseError);
              console.error("Failed to decode base64 service account:", decodeError);
              throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT format");
            }
          }
          
          initializeApp({
            credential: cert(serviceAccount)
          });
          console.log("Firebase Admin SDK initialized successfully");
        }
        // Get Firestore instance
        const firestore = getFirestore();
        
        // Update Firestore document with subscription data
        if (session.subscription) {
          console.log("Writing user data to Firestore:", {
            id: userId,
            subscription: {
              status: 'active',
              eventsQuota: planDetails.eventsQuota,
              eventsUsed: 0
            },
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            stripe_subscription_status: 'active',
            updatedAt: new Date()
          });
          
          // Create a reference to the user document in Firestore
          const userRef = firestore.collection('users').doc(userId);
          console.log(`Created Firestore reference for user ${userId}`);
          
          // Update the user document with subscription data
          try {
            await userRef.set({
              subscription: {
                status: 'active',
                eventsQuota: planDetails.eventsQuota,
                eventsUsed: 0
              },
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              stripe_subscription_status: 'active',
              updatedAt: new Date()
            }, {
              merge: true
            });
            
            console.log(`✅ Updated Firestore for user ${userId} with subscription data`);
            console.log(`  - Subscription ID: ${session.subscription}`);
            console.log(`  - Events Quota: ${planDetails.eventsQuota}`);
            console.log(`  - Status: active`);
          } catch (writeError) {
            console.error(`❌ Error writing to Firestore for user ${userId}:`, writeError);
            throw writeError;
          }
        } else {
          console.log(`No subscription data to write to Firestore for user ${userId}`);
        }
      } catch (firebaseError) {
        console.error('❌ Error updating Firestore:', firebaseError);
      }
      
      // Update user's subscription status in Supabase
      try {
        const updateData = {
          stripe_customer_id: session.customer,
          updated_at: new Date().toISOString()
        };
        
        // Only add subscription fields if we have a subscription
        if (session.subscription) {
          Object.assign(updateData, {
            stripe_subscription_id: session.subscription,
            stripe_subscription_status: 'active',
            subscription_status: 'active',
            subscription_events_quota: planDetails.eventsQuota,
            subscription_events_used: 0
          });
        }
        
        const { error } = await supabaseClient
          .from('users') 
          .update(updateData)
          .eq('id', userId);
          
        if (error) {
          console.error('❌ Error updating user subscription:', error);
        } else {
          console.log(`✅ Updated Firestore for user ${userId} with subscription data`);
          console.log(`  - Subscription ID: ${session.subscription}`);
          console.log(`  - Events Quota: ${planDetails.eventsQuota}`);
          console.log(`  - Status: active`);
        }

        // Update Firestore document
        if (session.subscription) {
          try {
            if (firestoreDb) {
              const userRef = firestoreDb.collection('users').doc(userId);
              await userRef.set({
                subscription: { status: 'active', eventsQuota: planDetails.eventsQuota, eventsUsed: 0 },
                stripe_customer_id: session.customer,
                stripe_subscription_id: session.subscription,
                stripe_subscription_status: 'active',
                updatedAt: new Date()
              }, { merge: true });
              console.log(`✅ Updated Firestore for user ${userId} with subscription data`);
            }
          } catch (firebaseError) {
            console.error('❌ Error updating Firestore:', firebaseError);
          }
        }

        // Also update the checkout session if it exists
        const { error: sessionUpdateError } = await supabaseClient.from('stripe_checkout_sessions').update({
          "status": 'completed',
          "completed_at": new Date().toISOString(),
          "subscription_id": session.subscription || null
        }).eq('id', session.id);
        if (sessionUpdateError) {
          console.warn('Warning: Could not update checkout session status:', sessionUpdateError);
        }
      } catch (error) {
        console.error('❌ Error updating user subscription:', error);
      }
    } else {
      console.log(`Customer ${session.customer} already exists, linked to user ${existingCustomer.user_id}`);
    }
    // Check if this is a featured demo purchase
    if (session.metadata?.feature_type === 'featured_demo' && session.metadata?.demo_id) {
      const demoId = session.metadata.demo_id;
      console.log(`Processing featured demo purchase for demo ${demoId}`);
      // Update the demo to be featured
      const { error: demoError } = await supabaseClient.from('demos').update({
        is_featured: true,
        updated_at: new Date().toISOString()
      }).eq('id', demoId);
      if (demoError) {
        console.error('❌ Error updating demo featured status:', demoError);
      } else {
        console.log(`✅ Demo ${demoId} marked as featured`);
      }
    }
  } catch (error) {
    console.error('❌ Error in handleCheckoutCompleted:', error);
  }
}
async function handleCustomerCreated(customer) {
  let userId = customer.metadata?.user_id;
  console.log(`Processing new customer: ${customer.id}`);
  console.log('Handling customer.created event');
  console.log(`- Customer ID: ${customer.id}`);
  console.log(`- Email: ${customer.email || 'Not set'}`);
  console.log(`- Metadata:`, customer.metadata);
  if (!userId) {
    console.warn('No user_id in customer metadata, checking recent checkout sessions');
    // Try to get userId from the most recent checkout session for this customer
    try {
      const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
        apiVersion: '2023-10-16'
      });
      const sessions = await stripe.checkout.sessions.list({
        customer: customer.id,
        limit: 1
      });
      if (sessions.data.length > 0) {
        userId = sessions.data[0].client_reference_id;
        if (userId) {
          console.log(`Retrieved user_id ${userId} from checkout session`);
        }
      }
    } catch (error) {
      console.error('Error retrieving checkout sessions:', error);
    }
    if (!userId) {
      console.warn('Could not determine user_id from checkout sessions, checking by email');
      // Try to find user by email
      if (customer.email) {
        const { data: userByEmail } = await supabaseClient.from('users').select('id').eq('email', customer.email).single();
        if (userByEmail) {
          userId = userByEmail.id;
          console.log(`✅ Found user ${userId} by email ${customer.email}`);
        } else {
          console.error(`❌ No user found with email ${customer.email}`);
          console.error('Could not determine user_id for customer, creating placeholder');
          userId = `placeholder_${Date.now()}`;
          console.log(`Generated placeholder ID: ${userId}`);
          return;
        }
      } else {
        console.error('❌ No email available and no user ID, cannot process customer');
        return;
      }
    }
  }
  try {
    // Store customer in stripe_customers table
    const { error } = await supabaseClient.from('stripe_customers').upsert({
      id: customer.id,
      user_id: userId,
      email: customer.email || '',
      name: customer.name || '',
      metadata: customer.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    if (error) {
      console.error('❌ Error storing customer:', error);
    } else {
      console.log(`✅ Stored customer ${customer.id} for user ${userId}`);
    }
    // Update user record with customer ID
    const { error: userError } = await supabaseClient.from('users') 
      .update({
        stripe_customer_id: customer.id,
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId);
    if (userError) {
      console.error('❌ Error updating user with customer ID:', userError);
    } else {
      console.log(`✅ Updated user ${userId} with customer ID ${customer.id}`);
    }

    // Update Firestore document
    try {
      if (firestoreDb) {
        const userRef = firestoreDb.collection('users').doc(userId);
        await userRef.set({
          stripe_customer_id: customer.id,
          updatedAt: new Date()
        }, { merge: true });
        console.log(`✅ Updated Firestore for user ${userId} with customer ID`);
      }
    } catch (firebaseError) {
      console.error('❌ Error updating Firestore:', firebaseError);
    }
  } catch (error) {
    console.error('❌ Error in handleCustomerCreated:', error);
  }
}
async function handleSubscriptionCreated(subscription) {
  let userId = subscription.metadata?.user_id;
  console.log(`Processing new subscription: ${subscription.id}`); 
  
  console.log('Handling customer.subscription.created event');
  console.log(`- Subscription ID: ${subscription.id}`);
  console.log(`- Customer: ${subscription.customer}`);
  console.log(`- Status: ${subscription.status}`);
  console.log(`- Metadata:`, subscription.metadata);
  if (!userId) {
    console.warn('No user_id in subscription metadata, checking customer');
    // Try to get userId from the customer
    try {
      const { data: customerData } = await supabaseClient.from('stripe_customers').select('user_id').eq('id', subscription.customer).single();
      if (customerData?.user_id) {
        userId = customerData.user_id;
        console.log(`✅ Retrieved user_id ${userId} from customer ${subscription.customer}`);
      } else {
        console.warn(`No user_id found for customer ${subscription.customer}`);
      }
    } catch (error) {
      console.error('Error retrieving user_id from customer:', error);
    }
    if (!userId) {
      console.error('❌ Could not determine user_id for subscription, creating placeholder');
      userId = `placeholder_${Date.now()}`;
      console.log(`Generated placeholder ID: ${userId}`);
      return;
    }
  }
  // Get plan details from price ID
  const priceId = subscription.items.data[0]?.price.id;
  console.log(`Subscription price ID: ${priceId}`);
  const planDetails = getPlanDetailsByPriceId(priceId || '');
  console.log(`Plan details: ${planDetails.planId}, Events Quota: ${planDetails.eventsQuota}`);
  try {
    // Store subscription in stripe_subscriptions table
    const { error: subscriptionError } = await supabaseClient.from('stripe_subscriptions').upsert({
      id: subscription.id,
      customer_id: subscription.customer, 
      user_id: userId,
      status: subscription.status,
      price_id: priceId,
      quantity: subscription.items.data[0]?.quantity || 1,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      metadata: subscription.metadata || {},
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString()
    });
    if (subscriptionError) {
      console.error('❌ Error storing subscription:', subscriptionError);
    } else {
      console.log(`✅ Stored subscription ${subscription.id} for user ${userId}`);
    }
    // Update user subscription info
    const { error } = await supabaseClient.from('users') 
      .update({
        stripe_subscription_id: subscription.id,
        stripe_subscription_status: subscription.status,
        stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        subscription_status: subscription.status === 'active' ? 'active' : 'inactive',
        subscription_events_quota: planDetails.eventsQuota,
        subscription_events_used: 0,
        updated_at: new Date().toISOString(), 
      })
      .eq('id', userId);
    if (error) {
      console.error('❌ Error updating user subscription info:', error);
    } else {
      console.log(`✅ Updated user ${userId} with subscription info`);
      console.log(`  - Subscription ID: ${subscription.id}`);
      console.log(`  - Events Quota: ${planDetails.eventsQuota}`);
      console.log(`  - Status: ${subscription.status}`);
    }

    // Update Firestore document
    try {
      if (firestoreDb) {
        const userRef = firestoreDb.collection('users').doc(userId);
        await userRef.set({
          subscription: { status: subscription.status, eventsQuota: planDetails.eventsQuota, eventsUsed: 0 },
          stripe_customer_id: subscription.customer,
          stripe_subscription_id: subscription.id,
          stripe_subscription_status: subscription.status,
          updatedAt: new Date()
        }, { merge: true });
        console.log(`✅ Updated Firestore for user ${userId} with subscription data`);
      }
    } catch (firebaseError) {
      console.error('❌ Error updating Firestore:', firebaseError);
    }
  } catch (error) {
    console.error('❌ Error in handleSubscriptionCreated:', error);
  }
}
async function handleSubscriptionUpdated(subscription) {
  let userId = subscription.metadata?.user_id;
  
  console.log('Handling customer.subscription.updated event');
  console.log(`- Subscription ID: ${subscription.id}`);
  console.log(`- Customer: ${subscription.customer}`);
  console.log(`- Status: ${subscription.status}`);
  console.log(`- Metadata:`, subscription.metadata);
  if (!userId) {
    console.warn('No user_id in subscription metadata, checking customer');
    // Try to get userId from the customer
    try {
      const { data: customerData } = await supabaseClient.from('stripe_customers').select('user_id').eq('id', subscription.customer).single();
      if (customerData?.user_id) {
        userId = customerData.user_id;
        console.log(`✅ Retrieved user_id ${userId} from customer ${subscription.customer}`);
      } else {
        console.warn(`No user_id found for customer ${subscription.customer}`);
        // Try to find subscription in database
        const { data: existingSubscription } = await supabaseClient.from('stripe_subscriptions').select('user_id').eq('id', subscription.id).single();
        if (existingSubscription?.user_id) {
          userId = existingSubscription.user_id;
          console.log(`✅ Found user_id ${userId} from existing subscription record`);
        } else {
          console.error('❌ Could not determine user_id for subscription update');
          return;
        }
      }
    } catch (error) {
      console.error('Error retrieving user_id for subscription update:', error);
      return;
    }
  }
  // Get plan details from price ID
  const priceId = subscription.items.data[0]?.price.id;
  const planDetails = getPlanDetailsByPriceId(priceId || '');
  console.log(`Plan details: ${planDetails.planId}, Events Quota: ${planDetails.eventsQuota}`);
  // Update Firestore with subscription data
  try {
    // Import Firebase Admin SDK
    const firebaseAdmin = await import('npm:firebase-admin/app');
    const firestoreModule = await import('npm:firebase-admin/firestore');
    
    const { initializeApp, cert, getApps } = firebaseAdmin;
    const { getFirestore } = firestoreModule;
    
    // Check if Firebase Admin SDK is already initialized
    if (getApps().length === 0) {
      // Get Firebase service account from environment variables
      const serviceAccountStr = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
      if (!serviceAccountStr) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set");
      }
      
      let serviceAccount;
      try {
        // Try to parse the service account JSON
        serviceAccount = JSON.parse(serviceAccountStr);
      } catch (parseError) {
        // If parsing fails, try to decode from base64
        try {
          const decoded = atob(serviceAccountStr);
          serviceAccount = JSON.parse(decoded);
        } catch (decodeError) {
          console.error("Failed to parse service account JSON:", parseError);
          console.error("Failed to decode base64 service account:", decodeError);
          throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT format");
        }
      }
      
      initializeApp({
        credential: cert(serviceAccount)
      });
      console.log("Firebase Admin SDK initialized successfully");
    }
    
    // Get Firestore instance
    const firestore = getFirestore();
    
    console.log(`Updating Firestore for user ${userId} with subscription data`);
    
    // Create a reference to the user document in Firestore
    const userRef = firestore.collection('users').doc(userId);
    
    // Update the user document with subscription data
    await userRef.set({
      subscription: {
        status: subscription.status === 'active' ? 'active' : 'inactive',
        eventsQuota: planDetails.eventsQuota,
        // Don't reset events_used on update to avoid losing usage data
      },
      stripe_customer_id: subscription.customer,
      stripe_subscription_id: subscription.id,
      stripe_subscription_status: subscription.status,
      updatedAt: new Date()
    }, {
      merge: true
    });
    
    console.log(`✅ Updated Firestore for user ${userId} with subscription data`);
    console.log(`  - Subscription ID: ${subscription.id}`);
    console.log(`  - Events Quota: ${planDetails.eventsQuota}`);
    console.log(`  - Status: ${subscription.status}`);
  } catch (firebaseError) {
    console.error('❌ Error updating Firestore:', firebaseError);
  }

  // Update subscription in stripe_subscriptions table
  const { error: updateError } = await supabaseClient.from('stripe_subscriptions').update({
    status: subscription.status,
    price_id: priceId,
    quantity: subscription.items.data[0]?.quantity || 1,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    metadata: subscription.metadata || {},
    updated_at: new Date().toISOString()
  }).eq('id', subscription.id);
  if (updateError) {
    console.error('❌ Error updating subscription record:', updateError);
  } else {
    console.log(`✅ Updated subscription record ${subscription.id}`);
  }
  // Update user subscription info
  const { error } = await supabaseClient.from('users') 
    .update({
      "stripe_subscription_status": subscription.status,
      "stripe_current_period_end": new Date(subscription.current_period_end * 1000).toISOString(),
      "subscription_status": subscription.status === 'active' ? 'active' : 'inactive',
      "subscription_events_quota": planDetails.eventsQuota,
      // Don't reset events_used on update to avoid losing usage data
      "updated_at": new Date().toISOString()
    }) 
    .eq('id', userId);
  if (error) {
    console.error('❌ Error updating user subscription info:', error);
  } else {
    console.log(`✅ Updated user ${userId} with subscription status ${subscription.status}`);
    console.log(`  - Events Quota: ${planDetails.eventsQuota}`);
    console.log(`  - Period End: ${new Date(subscription.current_period_end * 1000).toISOString()}`);
  }

  // Update Firestore document
  try {
    if (firestoreDb) {
      const userRef = firestoreDb.collection('users').doc(userId);
      await userRef.set({
        subscription: { 
          status: subscription.status === 'active' ? 'active' : 'inactive', 
          eventsQuota: planDetails.eventsQuota,
          // Don't reset eventsUsed to preserve usage data
        },
        stripe_subscription_status: subscription.status,
        updatedAt: new Date()
      }, { merge: true });
      console.log(`✅ Updated Firestore for user ${userId} with subscription data`);
    }
  } catch (firebaseError) {
    console.error('❌ Error updating Firestore:', firebaseError);
  }
}
async function handleSubscriptionDeleted(subscription) {
  let userId = subscription.metadata?.user_id;
  
  console.log('Handling customer.subscription.deleted event');
  console.log(`- Subscription ID: ${subscription.id}`);
  console.log(`- Customer: ${subscription.customer}`);
  console.log(`- Metadata:`, subscription.metadata);
  if (!userId) {
    console.warn('No user_id in subscription metadata, checking database');
    // Try to find subscription in database
    try {
      const { data: existingSubscription } = await supabaseClient.from('stripe_subscriptions').select('user_id').eq('id', subscription.id).single();
      if (existingSubscription?.user_id) {
        userId = existingSubscription.user_id;
        console.log(`✅ Found user_id ${userId} from existing subscription record`);
      } else {
        console.error('❌ Could not determine user_id for subscription deletion');
        return;
      }
    } catch (error) {
      console.error('Error retrieving user_id for subscription deletion:', error);
      return;
    }
  }
  // Update Firestore with subscription data
  try {
    // Import Firebase Admin SDK
    const firebaseAdmin = await import('npm:firebase-admin/app');
    const firestoreModule = await import('npm:firebase-admin/firestore');
    
    const { initializeApp, cert, getApps } = firebaseAdmin;
    const { getFirestore } = firestoreModule;
    
    // Check if Firebase Admin SDK is already initialized
    if (getApps().length === 0) {
      // Get Firebase service account from environment variables
      const serviceAccountStr = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
      if (!serviceAccountStr) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set");
      }
      
      let serviceAccount;
      try {
        // Try to parse the service account JSON
        serviceAccount = JSON.parse(serviceAccountStr);
      } catch (parseError) {
        // If parsing fails, try to decode from base64
        try {
          const decoded = atob(serviceAccountStr);
          serviceAccount = JSON.parse(decoded);
        } catch (decodeError) {
          console.error("Failed to parse service account JSON:", parseError);
          console.error("Failed to decode base64 service account:", decodeError);
          throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT format");
        }
      }
      
      initializeApp({
        credential: cert(serviceAccount)
      });
      console.log("Firebase Admin SDK initialized successfully");
    }
    
    // Get Firestore instance
    const firestore = getFirestore();
    
    console.log(`Updating Firestore for user ${userId} with canceled subscription data`);
    
    // Create a reference to the user document in Firestore
    const userRef = firestore.collection('users').doc(userId);
    
    // Update the user document with subscription data
    await userRef.set({
      subscription: {
        status: 'inactive',
        eventsQuota: 0,
      },
      stripe_subscription_status: 'canceled',
      updatedAt: new Date()
    }, {
      merge: true
    });
    
    console.log(`✅ Updated Firestore for user ${userId} with canceled subscription data`);
  } catch (firebaseError) {
    console.error('❌ Error updating Firestore:', firebaseError);
  }

  // Update subscription status
  const { error: updateError } = await supabaseClient.from('stripe_subscriptions').update({
    status: 'canceled',
    canceled_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }).eq('id', subscription.id);
  if (updateError) {
    console.error('❌ Error updating subscription status:', updateError);
  } else {
    console.log(`✅ Updated subscription ${subscription.id} status to canceled`);
  }
  // Update user subscription info
  const { error } = await supabaseClient.from('users') 
    .update({
      "stripe_subscription_status": 'canceled',
      "subscription_status": 'inactive',
      "subscription_events_quota": 0,
      "updated_at": new Date().toISOString() 
    })
    .eq('id', userId);
  if (error) {
    console.error('❌ Error updating user subscription status:', error);
  } else {
    console.log(`✅ Updated user ${userId} subscription status to inactive`);
  }

  // Update Firestore document
  try {
    if (firestoreDb) {
      const userRef = firestoreDb.collection('users').doc(userId);
      await userRef.set({
        subscription: { status: 'inactive', eventsQuota: 0 },
        stripe_subscription_status: 'canceled',
        updatedAt: new Date()
      }, { merge: true });
      console.log(`✅ Updated Firestore for user ${userId} with canceled subscription data`);
    }
  } catch (firebaseError) {
    console.error('❌ Error updating Firestore:', firebaseError);
  }
}
async function handlePaymentSucceeded(invoice) {
  const customerId = invoice.customer;
  
  console.log('Handling invoice.payment_succeeded event');
  console.log(`- Invoice ID: ${invoice.id}`);
  console.log(`- Customer: ${customerId}`);
  console.log(`- Subscription: ${invoice.subscription || 'None'}`);
  try {
    // Get user ID from customer - declare as a variable that can be reassigned
    let { data: customer, error: customerError } = await supabaseClient.from('stripe_customers').select('user_id').eq('id', customerId).single();
    // Initialize userId variable
    let userId = null;
    if (!customer || customerError) {
      console.error('❌ Customer not found for invoice:', customerError);
      // Try to find customer in Stripe
      try {
        const stripeCustomer = await stripe.customers.retrieve(customerId);
        if (typeof stripeCustomer !== 'string' && stripeCustomer.email) {
          // Try to find user by email
          const { data: userByEmail } = await supabaseClient.from('users').select('id').eq('email', stripeCustomer.email).single();
          if (userByEmail) {
            userId = userByEmail.id;
            console.log(`✅ Found user ${userId} by email lookup`);
            // Create customer record
            await supabaseClient.from('stripe_customers').insert({
              id: customerId,
              user_id: userId,
              email: stripeCustomer.email,
              name: stripeCustomer.name || '',
              created_at: new Date().toISOString()
            });
            console.log(`✅ Created missing customer record for ${customerId} linked to user ${userByEmail.id}`);
          } else {
            console.error(`❌ No user found with email ${stripeCustomer.email}`);
            return;
          }
        } else {
          console.error('❌ Could not retrieve customer from Stripe');
          return;
        }
      } catch (stripeError) {
        console.error('❌ Error retrieving customer from Stripe:', stripeError);
        return;
      }
    } else {
      userId = customer.user_id;
      console.log(`✅ Found user ${userId} from customer record`);
    }
    // If we still don't have a userId, we can't continue
    if (!userId) {
      console.error('❌ Could not determine user_id for invoice');
      return;
    }
    // Store invoice
    const { error: invoiceError } = await supabaseClient.from('stripe_invoices').upsert({
      id: invoice.id,
      customer_id: customerId,
      subscription_id: invoice.subscription || null,
      user_id: userId,
      amount_paid: invoice.amount_paid,
      amount_due: invoice.amount_due,
      currency: invoice.currency,
      status: invoice.status || 'paid',
      hosted_invoice_url: invoice.hosted_invoice_url,
      invoice_pdf: invoice.invoice_pdf,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    if (invoiceError) {
      console.error('❌ Error storing invoice:', invoiceError);
    } else {
      console.log(`✅ Stored invoice ${invoice.id} for user ${userId}`);
    }
    // If this is a subscription payment, get the subscription details
    if (invoice.subscription) {
      try { 
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        const priceId = subscription.items.data[0]?.price.id;
        const planDetails = getPlanDetailsByPriceId(priceId || '');
        
        console.log(`Subscription payment for ${invoice.subscription} with price ${priceId}`);
        console.log(`- Events Quota: ${planDetails.eventsQuota}`);
        // Reset events used count for new billing period and update subscription details
        const { error } = await supabaseClient.from('users') 
          .update({
            subscription_events_used: 0,
            subscription_events_quota: planDetails.eventsQuota,
            subscription_status: 'active',
            stripe_subscription_status: subscription.status,
            stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          }) 
          .eq('id', userId);
        if (error) {
          console.error('❌ Error updating user subscription details:', error);
        } else {
          console.log(`✅ Updated user ${userId} with subscription details and reset events count`);
        }

        // Update Firestore document
        try {
          if (firestoreDb) {
            const userRef = firestoreDb.collection('users').doc(userId);
            await userRef.set({
              subscription: { 
                status: 'active', 
                eventsQuota: planDetails.eventsQuota,
                eventsUsed: 0
              },
              updatedAt: new Date()
            }, { merge: true });
            console.log(`✅ Updated Firestore for user ${userId} with reset events count`);
          }
        } catch (firebaseError) {
          console.error('❌ Error updating Firestore:', firebaseError);
        }
      } catch (subError) {
        console.error('❌ Error retrieving subscription details:', subError);
        const { error } = await supabaseClient 
          .from('users') 
          .update({
            subscription_events_used: 0,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
        if (error) {
          console.error('❌ Error resetting events count:', error);
        } else {
          console.log(`✅ Reset events used count for user ${userId}`);
        }

        // Update Firestore document with just the reset events count
        try {
          if (firestoreDb) {
            const userRef = firestoreDb.collection('users').doc(userId);
            await userRef.set({
              'subscription.eventsUsed': 0,
              updatedAt: new Date()
            }, { merge: true });
            console.log(`✅ Reset events used count in Firestore for user ${userId}`);
          }
        } catch (firebaseError) {
          console.error('❌ Error updating Firestore:', firebaseError);
        }
      }
    } else {
      // For non-subscription invoices, just reset the events count
      const { error } = await supabaseClient 
        .from('users')
        .update({
          subscription_events_used: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
      if (error) {
        console.error('❌ Error resetting events count:', error);
      } else {
        console.log(`✅ Reset events used count for user ${userId}`);
      }

      // Update Firestore document
      try {
        if (firestoreDb) {
          const userRef = firestoreDb.collection('users').doc(userId);
          await userRef.set({
            'subscription.eventsUsed': 0,
            updatedAt: new Date()
          }, { merge: true });
          console.log(`✅ Reset events used count in Firestore for user ${userId}`);
        }
      } catch (firebaseError) {
        console.error('❌ Error updating Firestore:', firebaseError);
      }
    }
  } catch (error) {
    console.error('❌ Error in handlePaymentSucceeded:', error);
  }
}
async function handlePaymentFailed(invoice) {
  const customerId = invoice.customer;
  console.log('Handling invoice.payment_failed event');
  console.log(`- Invoice ID: ${invoice.id}`);
  console.log(`- Customer: ${customerId}`);
  // Get user ID from customer
  const { data: customer, error: customerError } = await supabaseClient.from('stripe_customers').select('user_id').eq('id', customerId).single();
  if (customerError || !customer) {
    console.error('❌ Customer not found for failed payment:', customerError);
    return;
  }
  // Store failed invoice
  const { error: invoiceError } = await supabaseClient.from('stripe_invoices').upsert({
    id: invoice.id,
    customer_id: customerId,
    subscription_id: invoice.subscription || null,
    user_id: customer.user_id,
    amount_paid: invoice.amount_paid,
    amount_due: invoice.amount_due,
    currency: invoice.currency,
    status: invoice.status || 'open',
    hosted_invoice_url: invoice.hosted_invoice_url,
    invoice_pdf: invoice.invoice_pdf,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  if (invoiceError) {
    console.error('❌ Error storing failed invoice:', invoiceError);
  } else {
    console.log(`✅ Stored failed invoice ${invoice.id} for user ${customer.user_id}`);
  }
  // Update user subscription status to reflect payment failure
  const { error: userError } = await supabaseClient.from('users').update({
    "subscription_status": 'past_due',
    "updated_at": new Date().toISOString()
  }).eq('id', customer.user_id);
  if (userError) {
    console.error('❌ Error updating user subscription status:', userError);
  } else {
    console.log(`✅ Updated user ${customer.user_id} subscription status to past_due`);
  }
}
async function handlePaymentMethodAttached(paymentMethod) {
  const customerId = paymentMethod.customer;
  console.log('Handling payment_method.attached event');
  console.log(`- Payment Method ID: ${paymentMethod.id}`);
  console.log(`- Customer: ${customerId}`);
  try {
    if (!customerId) {
      console.error('❌ No customer ID in payment method');
      return;
    }
    // Get user ID from customer
    const { data: customer, error: customerError } = await supabaseClient.from('stripe_customers').select('*').eq('id', customerId).single();
    // Initialize userId variable
    let userId = null;
    if (!customer || customerError) {
      console.error('❌ Customer not found for payment method:', customerError);
      // Try to find customer in Stripe
      try {
        const stripeCustomer = await stripe.customers.retrieve(customerId);
        if (typeof stripeCustomer !== 'string' && stripeCustomer.email) {
          // Try to find user by email
          const { data: userByEmail } = await supabaseClient.from('users').select('id').eq('email', stripeCustomer.email).single();
          if (userByEmail) {
            userId = userByEmail.id;
            console.log(`✅ Found user ${userId} by email lookup`);
            // Create customer record
            await supabaseClient.from('stripe_customers').insert({
              id: customerId,
              user_id: userId,
              email: stripeCustomer.email,
              name: stripeCustomer.name || '',
              created_at: new Date().toISOString()
            });
            console.log(`✅ Created missing customer record for ${customerId}`);
          } else {
            console.error(`❌ No user found with email ${stripeCustomer.email}`);
            return;
          }
        } else {
          console.error('❌ Could not retrieve customer from Stripe');
          return;
        }
      } catch (stripeError) {
        console.error('❌ Error retrieving customer from Stripe:', stripeError);
        return;
      }
    } else {
      userId = customer.user_id;
      console.log(`✅ Found user ${userId} from customer record`);
    }
    // If we still don't have a userId, we can't continue
    if (!userId) {
      console.error('❌ Could not determine user_id for invoice');
      return;
    }
    // Store payment method
    const { error: paymentMethodError } = await supabaseClient.from('stripe_payment_methods').upsert({
      id: paymentMethod.id,
      customer_id: customerId,
      user_id: userId,
      type: paymentMethod.type,
      card_brand: paymentMethod.card?.brand,
      card_last4: paymentMethod.card?.last4,
      card_exp_month: paymentMethod.card?.exp_month,
      card_exp_year: paymentMethod.card?.exp_year,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    if (paymentMethodError) {
      console.error('❌ Error storing payment method:', paymentMethodError);
    } else {
      console.log(`✅ Stored payment method ${paymentMethod.id} for user ${userId}`);
    }
    // If this is the first payment method, set it as default
    if (!customer.default_payment_method) {
      const { error: updateError } = await supabaseClient.from('stripe_customers').update({
        default_payment_method: paymentMethod.id,
        updated_at: new Date().toISOString()
      }).eq('id', customerId);
      if (updateError) {
        console.error('❌ Error setting default payment method:', updateError);
      } else {
        console.log(`✅ Set ${paymentMethod.id} as default payment method for customer ${customerId}`);
      }
    }
  } catch (error) {
    console.error('❌ Error in handlePaymentMethodAttached:', error);
  }
}
async function handlePaymentMethodDetached(paymentMethod) {
  console.log('Handling payment_method.detached event');
  console.log(`- Payment Method ID: ${paymentMethod.id}`);
  // Remove payment method from database
  const { error } = await supabaseClient.from('stripe_payment_methods').delete().eq('id', paymentMethod.id);
  if (error) {
    console.error('❌ Error deleting payment method:', error);
  } else {
    console.log(`✅ Deleted payment method ${paymentMethod.id}`);
  }
  // Check if this was a default payment method for any customer
  const { data: customers, error: customerError } = await supabaseClient.from('stripe_customers').select('id').eq('default_payment_method', paymentMethod.id);
  if (customerError) {
    console.error('❌ Error checking for customers using this payment method:', customerError);
  } else if (customers && customers.length > 0) {
    // Update customers to remove this as default payment method
    for (const customer of customers){
      const { error: updateError } = await supabaseClient.from('stripe_customers').update({
        default_payment_method: null,
        updated_at: new Date().toISOString()
      }).eq('id', customer.id);
      if (updateError) {
        console.error(`❌ Error updating customer ${customer.id} default payment method:`, updateError);
      } else {
        console.log(`✅ Removed ${paymentMethod.id} as default payment method for customer ${customer.id}`);
      }
    }
  }
}
async function handleCheckoutSessionCompleted(session) {
  try {
    // Try to get userId from client_reference_id first, then fallback to metadata
    let userId = session.client_reference_id || session.metadata?.user_id;
    console.log('Handling checkout.session.completed event (detailed)');
    console.log(`- Session ID: ${session.id}`);
    console.log(`- Client Reference ID: ${session.client_reference_id || 'Not set'}`);
    console.log(`- Metadata:`, session.metadata);
    console.log(`- Customer: ${session.customer || 'Not set'}`);
    console.log(`- Subscription: ${session.subscription || 'Not set'}`);
    console.log(`- Mode: ${session.mode}`);
    // Check if this is a featured demo purchase
    if (session.success_url?.includes('feature=featured_demo') && session.success_url?.includes('demoId=')) {
      // Extract the demo ID from the success URL
      const demoIdMatch = session.success_url.match(/demoId=([^&]+)/);
      if (demoIdMatch && demoIdMatch[1]) {
        const demoId = demoIdMatch[1];
        // Update the demo to be featured
        const { error } = await supabaseClient.from('demos').update({
          is_featured: true,
          updated_at: new Date().toISOString()
        }).eq('id', demoId);
        if (error) {
          console.error('❌ Error updating demo featured status:', error);
        } else {
          console.log(`✅ Demo ${demoId} marked as featured`);
        }
      }
    }
    // Check if this is a subscription purchase
    if (session.mode === 'subscription') {
      if (!userId) {
        console.warn('No user_id found in session for subscription purchase, checking customer');
        // Try to get userId from customer if available
        if (session.customer) {
          try {
            const { data: customerData } = await supabaseClient.from('stripe_customers').select('user_id').eq('id', session.customer).single();
            if (customerData?.user_id) {
              userId = customerData.user_id;
              console.log(`✅ Retrieved user_id ${userId} from customer ${session.customer}`);
            } else {
              console.warn(`No user_id found for customer ${session.customer}`);
            }
          } catch (error) {
            console.error('Error retrieving user_id from customer:', error);
          }
        }
        if (!userId) {
          console.error('❌ Could not determine user_id for subscription, checking email');
          // Try to find user by email
          if (session.customer_details?.email) {
            const { data: userByEmail } = await supabaseClient.from('users').select('id').eq('email', session.customer_details.email).single();
            if (userByEmail) {
              userId = userByEmail.id;
              console.log(`✅ Found user ${userId} by email ${session.customer_details.email}`);
            } else {
              console.error(`❌ No user found with email ${session.customer_details.email}`);
              return;
            }
          } else {
            console.error('❌ No email available, cannot process subscription');
            return;
          }
        }
      }
      const customerId = session.customer;
      const subscriptionId = session.subscription;
      // Get subscription details
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0]?.price.id;
      console.log(`Retrieved subscription details - Price ID: ${priceId}`);
      // Get plan details from price ID
      const planDetails = getPlanDetailsByPriceId(priceId);
      console.log(`Plan details: ${planDetails.planId}, Events Quota: ${planDetails.eventsQuota}`);
      // Store customer in stripe_customers table if it doesn't exist
      const { data: existingCustomer1 } = await supabaseClient.from('stripe_customers').select('*').eq('id', customerId).single();
      if (!existingCustomer1) {
        console.log(`Creating new customer record for ${customerId}`);
        await supabaseClient.from('stripe_customers').insert({
          id: customerId,
          user_id: userId,
          email: session.customer_details?.email || '',
          name: session.customer_details?.name || '',
          metadata: {
            checkout_session_id: session.id,
            client_reference_id: session.client_reference_id
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } else {
        console.log(`Customer ${customerId} already exists, linked to user ${existingCustomer1.user_id}`);
      }
      // Store subscription in stripe_subscriptions table
      const { error: subscriptionError } = await supabaseClient.from('stripe_subscriptions').upsert({
        id: subscriptionId,
        customer_id: customerId,
        user_id: userId,
        status: subscription.status,
        price_id: priceId,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        metadata: subscription.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      if (subscriptionError) {
        console.error('❌ Error storing subscription:', subscriptionError);
      } else {
        console.log(`✅ Stored subscription ${subscriptionId} for user ${userId}`);
      }
      // Update user's subscription status
      const { error } = await supabaseClient.from('users').update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        subscription_status: 'active',
        subscription_events_quota: planDetails.eventsQuota,
        subscription_events_used: 0,
        stripe_subscription_status: subscription.status,
        stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }).eq('id', userId);
      if (error) {
        console.error('❌ Error updating user subscription:', error);
      } else {
        console.log(`✅ User ${userId} subscription activated with plan ${planDetails.planId}`);
        console.log(`  - Subscription ID: ${subscriptionId}`);
        console.log(`  - Events Quota: ${planDetails.eventsQuota}`);
        console.log(`  - Period End: ${new Date(subscription.current_period_end * 1000).toISOString()}`);
      }
    }
  } catch (error) {
    console.error('❌ Error in handleCheckoutSessionCompleted:', error);
  }
}
function getPlanDetailsByPriceId(priceId) {
  const planMapping = {
    // Monthly plans
    'price_starter_monthly': {
      planId: 'starter',
      eventsQuota: 3
    },
    'price_professional_monthly': {
      planId: 'professional',
      eventsQuota: 8
    },
    'price_enterprise_monthly': {
      planId: 'enterprise',
      eventsQuota: 15
    },
    'price_team_monthly': {
      planId: 'team',
      eventsQuota: 10
    },
    // Annual plans
    'price_starter_annual': {
      planId: 'starter',
      eventsQuota: 3
    },
    'price_professional_annual': {
      planId: 'professional',
      eventsQuota: 8
    },
    'price_enterprise_annual': {
      planId: 'enterprise',
      eventsQuota: 15
    },
    'price_team_annual': {
      planId: 'team',
      eventsQuota: 10
    },
    // Legacy or alternative naming
    'price_starter_monthly_annual': {
      planId: 'starter',
      eventsQuota: 3
    },
    'price_professional_monthly_annual': {
      planId: 'professional',
      eventsQuota: 8
    },
    'price_enterprise_monthly_annual': {
      planId: 'enterprise',
      eventsQuota: 15
    },
    'price_team_monthly_annual': {
      planId: 'team',
      eventsQuota: 10
    },
    // Live mode price IDs (if different)
    'price_1Rif3UGCopIxkzs6WPBgO8wt': {
      planId: 'starter',
      eventsQuota: 3
    },
    'price_1Rif4MGCopIxkzs6EN1InWXN': {
      planId: 'professional',
      eventsQuota: 8
    },
    'price_1Rif6HGCopIxkzs6rLt5gZQf': {
      planId: 'enterprise',
      eventsQuota: 15
    },
    'price_1RiexMGCopIxkzs6f8lx95gU': {
      planId: 'team',
      eventsQuota: 10
    }
  };
  const plan = planMapping[priceId];
  if (!plan) {
    console.warn(`Unknown price ID: ${priceId}, defaulting to starter plan`);
    return {
      planId: 'starter',
      eventsQuota: 3
    };
  }
  console.log(`Mapped price ID ${priceId} to plan ${plan.planId} with ${plan.eventsQuota} events quota`);
  return plan;
}