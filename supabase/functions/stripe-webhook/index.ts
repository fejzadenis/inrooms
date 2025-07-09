import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { initializeApp, cert, getApps } from "npm:firebase-admin/app"
import { getFirestore } from "npm:firebase-admin/firestore"

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Initialize Stripe with the secret key
// Initialize Stripe with the secret key
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

// Initialize Supabase client
// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      persistSession: false
    }
  }
);

const cryptoProvider = Stripe.createSubtleCryptoProvider()

// Initialize Firebase Admin SDK
let firestoreDb: any = null;

try {
  if (getApps().length === 0) {
    // Get Firebase service account from environment variables
    const serviceAccountStr = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
    if (!serviceAccountStr) {
      console.error("FIREBASE_SERVICE_ACCOUNT environment variable is not set");
    } else {
      const serviceAccount = JSON.parse(serviceAccountStr);
      
      initializeApp({
        credential: cert(serviceAccount)
      });
      
      firestoreDb = getFirestore();
      console.log("[Firebase] Admin SDK initialized");
    }
  } else {
    firestoreDb = getFirestore();
  }
} catch (initError) {
  console.error("Error initializing Firebase Admin SDK:", initError);
}

// Log webhook initialization
console.log('Webhook endpoint initialized with:');
console.log(`- Supabase URL: ${Deno.env.get('SUPABASE_URL') ? 'Set' : 'Not set'}`);
console.log(`- Stripe Secret Key: ${Deno.env.get('STRIPE_SECRET_KEY') ? 'Set' : 'Not set'}`);
console.log(`- Webhook Secret: ${Deno.env.get('STRIPE_WEBHOOK_SECRET') ? 'Set' : 'Not set'}`);
console.log(`- Firebase: ${firestoreDb ? 'Initialized' : 'Not initialized'}`);

serve(async (request: Request) => {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const signature = request.headers.get('Stripe-Signature')
  const body = await request.text()
  
  if (!signature) {
    console.error('No Stripe signature found in request headers')
    return new Response(
      JSON.stringify({ error: 'No Stripe signature found' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
  
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET environment variable is not set')
    return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    console.log(`Attempting to verify webhook signature: ${signature.substring(0, 20)}...`)
    console.log('Webhook endpoint initialized with:')
    console.log(`- Supabase URL: ${Deno.env.get('SUPABASE_URL') ? 'Set' : 'Not set'}`)
    console.log(`- Stripe Secret Key: ${Deno.env.get('STRIPE_SECRET_KEY') ? 'Set' : 'Not set'}`)
    console.log(`- Webhook Secret: ${Deno.env.get('STRIPE_WEBHOOK_SECRET') ? 'Set' : 'Not set'}`)
    
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    )

    console.log(`✅ Received valid event: ${event.type}`);
    console.log(`Handling ${event.type} event`);

    // Update checkout session status if applicable
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      try {
        // Update the checkout session status in the database
        const { error } = await supabaseClient
          .from("stripe_checkout_sessions")
          .update({
            "status": 'completed',
            "status": 'completed',
            "completed_at": new Date().toISOString(),
            "subscription_id": session.subscription || null
          })
          .eq("id", session.id);
          
        if (error) {
          console.error('Error updating checkout session status:', error);
        } else {
          console.log(`Updated checkout session ${session.id} status to completed`);
        }
      } catch (updateError) {
        console.error('Error updating checkout session:', updateError);
      }
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      
      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer)
        break
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'payment_method.attached':
        await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod)
        break

      case 'payment_method.detached':
        await handlePaymentMethodDetached(event.data.object as Stripe.PaymentMethod)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true, event: event.type }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Webhook error:', error.message)
    return new Response(
      JSON.stringify({ error: 'Webhook error', message: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Try to get userId from client_reference_id first, then fallback to metadata
  let userId = session.client_reference_id || session.metadata?.user_id;
  
  console.log('Handling checkout.session.completed event');
  
  console.log(`- Session ID: ${session.id}`);
  console.log(`- Client Reference ID: ${session.client_reference_id || 'Not set'}`);
  console.log(`- Metadata:`, session.metadata);
  console.log(`- Customer: ${session.customer || 'Not set'}`);
  console.log(`- Customer Email: ${session.customer_details?.email || 'Not set'}`)
  console.log(`- Subscription: ${session.subscription || 'Not set'}`)
  
  if (!userId) {
    console.error('No user_id in session client_reference_id or metadata, attempting to find from email or customer');
    
    // Try to find user by email first (most reliable method)
    if (session.customer_details?.email) {
      try {
        console.log(`Looking up user by email: ${session.customer_details.email}`);
        const { data: userByEmail } = await supabaseClient
          .from('users')
          .select('id')
          .eq('email', session.customer_details.email)
          .single();
          
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
        const { data: customerData, error: customerError } = await supabaseClient
          .from('stripe_customers')
          .select('user_id')
          .eq('id', session.customer)
          .single()
          
        if (customerData?.user_id) {
          userId = customerData.user_id
          console.log(`Retrieved user_id ${userId} from Supabase customer ${session.customer}`);
        } else {
          console.warn(`No user_id found for customer ${session.customer}`)
        }
      } catch (error) {
        console.error('Error retrieving user_id from customer:', error);
      }
    }
    
    // If we still don't have a userId, try to create a placeholder from email
    if (!userId && session.customer_details?.email) {
      console.log(`Creating placeholder user ID from email: ${session.customer_details.email}`)
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
      const { data: existingCustomer } = await supabaseClient
        .from('stripe_customers')
        .select('id')
        .eq('id', session.customer as string)
        .single()
        
      if (!existingCustomer) {
        console.log(`Creating new customer record for ${session.customer} linked to user ${userId}`);
        const { error: customerInsertError } = await supabaseClient
          .from('stripe_customers')
          .insert({
            id: session.customer as string,
            user_id: userId,
            email: session.customer_details?.email || '',
            name: session.customer_details?.name || '',
            metadata: {
              checkout_session_id: session.id,
              client_reference_id: session.client_reference_id,
              user_id: userId
            },
            created_at: new Date().toISOString()
          })
          
        if (customerInsertError) {
          console.error('❌ Error creating customer record:', customerInsertError);
        }
      }
      
      // Get plan details from subscription if available
      let planDetails = { planId: 'default', eventsQuota: 0 };
      if (session.subscription) {
        try {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId = subscription.items.data[0]?.price.id;
          planDetails = getPlanDetailsByPriceId(priceId || '');
        } catch (error) {
          console.error('Error retrieving subscription details:', error);
        }
      }
      
      // Initialize Firebase Admin SDK if not already initialized
      try {
        if (!firestoreDb) {
          console.error("Firebase Firestore not initialized");
          throw new Error("Firebase Firestore not initialized");
        }
        
        // Get plan details from subscription if available
        let planDetails = { planId: 'default', eventsQuota: 0 };
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId = subscription.items.data[0]?.price.id;
          planDetails = getPlanDetailsByPriceId(priceId || '');
          
          console.log(`Updating Firestore for user ${userId} with subscription data`);
          const userRef = firestoreDb.collection('users').doc(userId);
          await userRef.update({
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
          console.log(`✅ Updated Firestore for user ${userId} with subscription data`);
          console.log(`  - Subscription ID: ${session.subscription}`);
          console.log(`  - Events Quota: ${planDetails.eventsQuota}`);
          console.log(`  - Status: active`);
        }
      } catch (firebaseError) {
        console.error('❌ Error updating Firestore:', firebaseError);
      }
    }
  }
  // Store checkout session in Supabase for record keeping
  try {
    // Update the checkout session if it exists
    const { error: sessionUpdateError } = await supabaseClient
      .from("stripe_checkout_sessions")
      .update({ 
        "status": 'completed',
        "completed_at": new Date().toISOString(),
        "subscription_id": session.subscription || null
      })
      .eq("id", session.id);
      
    if (sessionUpdateError) {
      console.warn('Warning: Could not update checkout session status:', sessionUpdateError);
    } else {
      console.log(`✅ Updated checkout session ${session.id} status to completed`);
    }
  } catch (error) {
    console.error('❌ Error updating checkout session:', error);
  }
  
  // Update Firebase user data
}

async function handleCustomerCreated(customer: Stripe.Customer) {
  let userId = customer.metadata?.user_id;
  console.log(`Processing new customer: ${customer.id}`);
  
  console.log('Handling customer.created event');
  console.log(`- Customer ID: ${customer.id}`);
  console.log(`- Email: ${customer.email || 'Not set'}`);
  console.log(`- Metadata:`, customer.metadata);
  
  // Store customer in Supabase for record keeping
  try {
    if (userId) {
      const { error } = await supabaseClient
        .from('stripe_customers')
        .upsert({
          id: customer.id,
          user_id: userId,
          email: customer.email || '',
          name: customer.name || '',
          metadata: customer.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Error storing customer in Supabase:', error);
      } else {
        console.log(`✅ Stored customer ${customer.id} in Supabase for user ${userId}`);
      }
    }
  } catch (error) {
    console.error('❌ Error in handleCustomerCreated:', error);
  }
  
  // Update Firebase if we have a user ID
  if (userId && firestoreDb) {
    try {
      const userRef = firestoreDb.collection('users').doc(userId);
      
      await userRef.update({
        stripe_customer_id: customer.id,
        updatedAt: new Date()
      });
      
      console.log(`[Firebase] ✅ Updated user ${userId} with customer ID ${customer.id}`);
    } catch (error) {
      console.error(`[Firebase] ❌ Error updating user ${userId} with customer ID:`, error);
    }
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  let userId = subscription.metadata?.user_id;
  console.log(`Processing new subscription: ${subscription.id}`);
  
  console.log('Handling customer.subscription.created event');
  console.log(`- Subscription ID: ${subscription.id}`);
  console.log(`- Customer: ${subscription.customer}`);
  console.log(`- Status: ${subscription.status}`);
  console.log(`- Metadata:`, subscription.metadata);
  
  if (!userId) {
    // Try to get userId from the customer in Supabase
    try {
      const { data: customerData } = await supabaseClient
        .from('stripe_customers')
        .select('user_id')
        .eq('id', subscription.customer)
        .single();
        
      if (customerData?.user_id) {
        userId = customerData.user_id;
        console.log(`✅ Retrieved user_id ${userId} from Supabase customer ${subscription.customer}`);
      }
    } catch (error) {
      console.error('Error retrieving user_id from Supabase customer:', error);
    }
    
    // If still no userId, try to get it from Stripe customer
    if (!userId) {
      try {
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        if (typeof customer !== 'string' && customer.metadata?.user_id) {
          userId = customer.metadata.user_id;
          console.log(`✅ Retrieved user_id ${userId} from Stripe customer metadata`);
        }
      } catch (error) {
        console.error('Error retrieving customer from Stripe:', error);
      }
    }
  }
  
  // Store subscription in Supabase for record keeping
  try {
    if (userId) {
      const { error } = await supabaseClient
        .from('stripe_subscriptions')
        .upsert({
          id: subscription.id,
          customer_id: subscription.customer as string,
          user_id: userId,
          status: subscription.status,
          price_id: subscription.items.data[0]?.price.id,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          metadata: subscription.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (error) {
        console.error('❌ Error storing subscription in Supabase:', error);
      } else {
        console.log(`✅ Stored subscription ${subscription.id} in Supabase for user ${userId}`);
      }
    }
  } catch (error) {
    console.error('❌ Error storing subscription in Supabase:', error);
  }

  // Get plan details from price ID
  const priceId = subscription.items.data[0]?.price.id;
  console.log(`Subscription price ID: ${priceId}`);
  const planDetails = getPlanDetailsByPriceId(priceId || '');
  console.log(`Plan details: ${planDetails.planId}, Events Quota: ${planDetails.eventsQuota}`);

  // Update Firebase if we have a user ID
  if (userId && firestoreDb) {
    try {
      const userRef = firestoreDb.collection('users').doc(userId);
      
      // Make sure we have valid dates for Firestore
      const currentPeriodStart = new Date(subscription.current_period_start * 1000);
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      
      await userRef.update({
        subscription: {
          status: subscription.status === 'active' ? 'active' : 'inactive',
          eventsQuota: planDetails.eventsQuota,
          eventsUsed: 0, // Reset events used for new subscription
        },
        stripe_subscription_id: subscription.id,
        stripe_subscription_status: subscription.status,
        stripe_current_period_end: currentPeriodEnd,
        updatedAt: new Date()
      });
      
      console.log(`[Firebase] ✅ Updated user ${userId} with subscription info`);
      console.log(`[Firebase]   - Subscription ID: ${subscription.id}`);
      console.log(`[Firebase]   - Events Quota: ${planDetails.eventsQuota}`);
      console.log(`[Firebase]   - Status: ${subscription.status}`);
    } catch (error) {
      console.error(`[Firebase] ❌ Error updating user ${userId} with subscription:`, error);
    }
  } else {
    console.error(`[Firebase] ❌ Cannot update user: ${!userId ? 'No user ID' : 'Firestore not initialized'}`);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  let userId = subscription.metadata?.user_id;
  
  console.log('Handling customer.subscription.updated event');
  console.log(`- Subscription ID: ${subscription.id}`);
  console.log(`- Customer: ${subscription.customer}`);
  console.log(`- Status: ${subscription.status}`);
  console.log(`- Metadata:`, subscription.metadata);
  
  if (!userId) {
    // Try to get userId from Supabase
    try {
      // First try from stripe_subscriptions table
      const { data: subscriptionData } = await supabaseClient
        .from('stripe_subscriptions')
        .select('user_id')
        .eq('id', subscription.id)
        .single();
        
      if (subscriptionData?.user_id) {
        userId = subscriptionData.user_id;
        console.log(`✅ Retrieved user_id ${userId} from Supabase subscription record`);
      } else {
        // Try from stripe_customers table
        const { data: customerData } = await supabaseClient
          .from('stripe_customers')
          .select('user_id')
          .eq('id', subscription.customer)
          .single();
          
        if (customerData?.user_id) {
          userId = customerData.user_id;
          console.log(`✅ Retrieved user_id ${userId} from Supabase customer record`);
        }
      }
    } catch (error) {
      console.error('Error retrieving user_id from Supabase:', error);
    }
  }

  // Update subscription in Supabase for record keeping
  try {
    if (userId) {
      const { error } = await supabaseClient
        .from('stripe_subscriptions')
        .update({
          status: subscription.status,
          price_id: subscription.items.data[0]?.price.id,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);
        
      if (error) {
        console.error('❌ Error updating subscription in Supabase:', error);
      } else {
        console.log(`✅ Updated subscription ${subscription.id} in Supabase`);
      }
    }
  } catch (error) {
    console.error('❌ Error updating subscription in Supabase:', error);
  }

  // Get plan details from price ID
  const priceId = subscription.items.data[0]?.price.id;
  const planDetails = getPlanDetailsByPriceId(priceId || '');
  console.log(`Plan details: ${planDetails.planId}, Events Quota: ${planDetails.eventsQuota}`);

  // Update Firebase if we have a user ID
  if (userId && firestoreDb) {
    try {
      const userRef = firestoreDb.collection('users').doc(userId);
      
      // Make sure we have valid dates for Firestore
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      
      await userRef.update({
        subscription: {
          status: subscription.status === 'active' ? 'active' : 'inactive',
          eventsQuota: planDetails.eventsQuota,
          // Don't reset eventsUsed on update to preserve usage data
        },
        stripe_subscription_status: subscription.status,
        stripe_current_period_end: currentPeriodEnd,
        updatedAt: new Date()
      });
      
      console.log(`[Firebase] ✅ Updated user ${userId} with subscription status ${subscription.status}`);
      console.log(`[Firebase]   - Events Quota: ${planDetails.eventsQuota}`);
      console.log(`[Firebase]   - Period End: ${currentPeriodEnd.toISOString()}`);
    } catch (error) {
      console.error(`[Firebase] ❌ Error updating user ${userId} with subscription:`, error);
    }
  } else {
    console.error(`[Firebase] ❌ Cannot update user: ${!userId ? 'No user ID' : 'Firestore not initialized'}`);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  let userId = subscription.metadata?.user_id;
  
  console.log('Handling customer.subscription.deleted event');
  console.log(`- Subscription ID: ${subscription.id}`);
  console.log(`- Customer: ${subscription.customer}`);
  console.log(`- Metadata:`, subscription.metadata);
  
  if (!userId) {
    // Try to find subscription in Supabase
    try {
      const { data: subscriptionData } = await supabaseClient
        .from('stripe_subscriptions')
        .select('user_id')
        .eq('id', subscription.id)
        .single();
        
      if (subscriptionData?.user_id) {
        userId = subscriptionData.user_id;
        console.log(`✅ Found user_id ${userId} from Supabase subscription record`);
      }
    } catch (error) {
      console.error('Error retrieving user_id from Supabase:', error);
    }
  }

  // Update subscription in Supabase for record keeping
  try {
    const { error } = await supabaseClient
      .from('stripe_subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id);
      
    if (error) {
      console.error('❌ Error updating subscription status in Supabase:', error);
    } else {
      console.log(`✅ Updated subscription ${subscription.id} status to canceled in Supabase`);
    }
  } catch (error) {
    console.error('❌ Error updating subscription in Supabase:', error);
  }

  // Update Firebase if we have a user ID
  if (userId && firestoreDb) {
    try {
      const userRef = firestoreDb.collection('users').doc(userId);
      
      await userRef.update({
        subscription: {
          status: 'inactive',
          eventsQuota: 0,
          // Keep eventsUsed as is
        },
        stripe_subscription_status: 'canceled',
        updatedAt: new Date()
      });
      
      console.log(`[Firebase] ✅ Updated user ${userId} subscription status to inactive`);
    } catch (error) {
      console.error(`[Firebase] ❌ Error updating user ${userId} subscription:`, error);
    }
  } else {
    console.error(`[Firebase] ❌ Cannot update user: ${!userId ? 'No user ID' : 'Firestore not initialized'}`);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  let userId = null;
  
  console.log('Handling invoice.payment_succeeded event');
  console.log(`- Invoice ID: ${invoice.id}`);
  console.log(`- Customer: ${customerId}`);
  console.log(`- Subscription: ${invoice.subscription || 'None'}`);
  
  // Try to get user ID from Supabase
  try {
    const { data: customerData } = await supabaseClient
      .from('stripe_customers')
      .select('user_id')
      .eq('id', customerId)
      .single();
      
    if (customerData?.user_id) {
      userId = customerData.user_id;
      console.log(`✅ Found user ${userId} from Supabase customer record`);
    }
  } catch (error) {
    console.error('Error retrieving user_id from Supabase:', error);
  }
  
  // If no user ID from Supabase, try to get it from Stripe
  if (!userId) {
    try {
      
      const customer = await stripe.customers.retrieve(customerId);
      if (typeof customer !== 'string' && customer.metadata?.user_id) {
        userId = customer.metadata.user_id;
        console.log(`✅ Found user ${userId} from Stripe customer metadata`);
      }
    } catch (error) {
      console.error('Error retrieving customer from Stripe:', error);
    }
  }
  
  // Store invoice in Supabase for record keeping
  try {
    if (userId) {
      const { error } = await supabaseClient
        .from('stripe_invoices')
        .upsert({
          id: invoice.id,
          customer_id: customerId,
          subscription_id: invoice.subscription as string || null,
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
        
      if (error) {
        console.error('❌ Error storing invoice in Supabase:', error);
      } else {
        console.log(`✅ Stored invoice ${invoice.id} for user ${userId}`);
      }
    }
  } catch (error) {
    console.error('❌ Error storing invoice in Supabase:', error);
  }

  // If this is a subscription payment, update Firebase
  if (invoice.subscription && userId && firestoreDb) {
    try {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
      const priceId = subscription.items.data[0]?.price.id;
      const planDetails = getPlanDetailsByPriceId(priceId || '');
      
      console.log(`Subscription payment for ${invoice.subscription} with price ${priceId}`);
      console.log(`- Events Quota: ${planDetails.eventsQuota}`);
      
      const userRef = firestoreDb.collection('users').doc(userId);
      
      // Get current user data to preserve eventsUsed if needed
      const userDoc = await userRef.get();
      const userData = userDoc.data();
      
      await userRef.update({
        subscription: {
          status: 'active',
          eventsQuota: planDetails.eventsQuota,
          eventsUsed: 0, // Reset events used for new billing period
        },
        stripe_subscription_status: subscription.status,
        stripe_current_period_end: new Date(subscription.current_period_end * 1000),
        updatedAt: new Date()
      });
      
      console.log(`[Firebase] ✅ Updated user ${userId} with subscription details and reset events count`);
    } catch (error) {
      console.error(`[Firebase] ❌ Error updating user ${userId}:`, error);
    }
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  let userId = null;
  
  console.log('Handling invoice.payment_failed event');
  console.log(`- Invoice ID: ${invoice.id}`);
  console.log(`- Customer: ${customerId}`);
  
  // Try to get user ID from Supabase
  try {
    const { data: customerData } = await supabaseClient
      .from('stripe_customers')
      .select('user_id')
      .eq('id', customerId)
      .single();
      
    if (customerData?.user_id) {
      userId = customerData.user_id;
      console.log(`✅ Found user ${userId} from Supabase customer record`);
    }
  } catch (error) {
    console.error('Error retrieving user_id from Supabase:', error);
  }
  
  // If no user ID from Supabase, try to get it from Stripe
  if (!userId) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (typeof customer !== 'string' && customer.metadata?.user_id) {
        userId = customer.metadata.user_id;
        console.log(`✅ Found user ${userId} from Stripe customer metadata`);
      }
    } catch (error) {
      console.error('Error retrieving customer from Stripe:', error);
    }
  }
  
  // Store failed invoice in Supabase for record keeping
  try {
    if (userId) {
      const { error } = await supabaseClient
        .from('stripe_invoices')
        .upsert({
          id: invoice.id,
          customer_id: customerId,
          subscription_id: invoice.subscription as string || null,
          user_id: userId,
          amount_paid: invoice.amount_paid,
          amount_due: invoice.amount_due,
          currency: invoice.currency,
          status: invoice.status || 'open',
          hosted_invoice_url: invoice.hosted_invoice_url,
          invoice_pdf: invoice.invoice_pdf,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (error) {
        console.error('❌ Error storing failed invoice in Supabase:', error);
      } else {
        console.log(`✅ Stored failed invoice ${invoice.id} for user ${userId}`);
      }
    }
  } catch (error) {
    console.error('❌ Error storing invoice in Supabase:', error);
  }

  // Update Firebase if we have a user ID
  if (userId && firestoreDb) {
    try {
      const userRef = firestoreDb.collection('users').doc(userId);
      
      await userRef.update({
        subscription: {
          status: 'past_due',
          // Keep existing quota and usage
        },
        updatedAt: new Date()
      });
      
      console.log(`[Firebase] ✅ Updated user ${userId} subscription status to past_due`);
    } catch (error) {
      console.error(`[Firebase] ❌ Error updating user ${userId}:`, error);
    }
  } else {
    console.error(`[Firebase] ❌ Cannot update user: ${!userId ? 'No user ID' : 'Firestore not initialized'}`);
  }
}

async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
  const customerId = paymentMethod.customer as string;
  let userId = null;
  
  console.log('Handling payment_method.attached event');
  console.log(`- Payment Method ID: ${paymentMethod.id}`);
  console.log(`- Customer: ${customerId}`);
  
  // Try to get user ID from Supabase
  try {
    const { data: customerData } = await supabaseClient
      .from('stripe_customers')
      .select('user_id')
      .eq('id', customerId)
      .single();
      
    if (customerData?.user_id) {
      userId = customerData.user_id;
      console.log(`✅ Found user ${userId} from Supabase customer record`);
    }
  } catch (error) {
    console.error('Error retrieving user_id from Supabase:', error);
  }
  
  // Store payment method in Supabase for record keeping
  try {
    if (userId) {
      const { error } = await supabaseClient
        .from('stripe_payment_methods')
        .upsert({
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
        
      if (error) {
        console.error('❌ Error storing payment method in Supabase:', error);
      } else {
        console.log(`✅ Stored payment method ${paymentMethod.id} for user ${userId}`);
      }
    }
  } catch (error) {
    console.error('❌ Error storing payment method in Supabase:', error);
  }
}

async function handlePaymentMethodDetached(paymentMethod: Stripe.PaymentMethod) {
  console.log('Handling payment_method.detached event');
  console.log(`- Payment Method ID: ${paymentMethod.id}`);
  
  // Remove payment method from Supabase for record keeping
  try {
    const { error } = await supabaseClient
      .from('stripe_payment_methods')
      .delete()
      .eq('id', paymentMethod.id);
      
    if (error) {
      console.error('❌ Error deleting payment method from Supabase:', error);
    } else {
      console.log(`✅ Deleted payment method ${paymentMethod.id} from Supabase`);
    }
  } catch (error) {
    console.error('❌ Error deleting payment method from Supabase:', error);
  }
}

function getPlanDetailsByPriceId(priceId: string): { planId: string; eventsQuota: number } {
  const planMapping: Record<string, { planId: string; eventsQuota: number }> = {
    // Monthly plans
    'price_starter_monthly': { planId: 'starter', eventsQuota: 3 },
    'price_professional_monthly': { planId: 'professional', eventsQuota: 8 },
    'price_enterprise_monthly': { planId: 'enterprise', eventsQuota: 15 },
    'price_team_monthly': { planId: 'team', eventsQuota: 10 },
    
    // Annual plans
    'price_starter_annual': { planId: 'starter', eventsQuota: 3 },
    'price_professional_annual': { planId: 'professional', eventsQuota: 8 },
    'price_enterprise_annual': { planId: 'enterprise', eventsQuota: 15 },
    'price_team_annual': { planId: 'team', eventsQuota: 10 },
    
    // Legacy or alternative naming
    'price_starter_monthly_annual': { planId: 'starter', eventsQuota: 3 },
    'price_professional_monthly_annual': { planId: 'professional', eventsQuota: 8 },
    'price_enterprise_monthly_annual': { planId: 'enterprise', eventsQuota: 15 },
    'price_team_monthly_annual': { planId: 'team', eventsQuota: 10 },
    
    // Live mode price IDs (if different)
    'price_1Rif3UGCopIxkzs6WPBgO8wt': { planId: 'starter', eventsQuota: 3 },
    'price_1Rif4MGCopIxkzs6EN1InWXN': { planId: 'professional', eventsQuota: 8 },
    'price_1Rif6HGCopIxkzs6rLt5gZQf': { planId: 'enterprise', eventsQuota: 15 },
    'price_1RiexMGCopIxkzs6f8lx95gU': { planId: 'team', eventsQuota: 10 },
  }

  const plan = planMapping[priceId];
  if (!plan) {
    console.warn(`Unknown price ID: ${priceId}, defaulting to starter plan`);
    return { planId: 'starter', eventsQuota: 3 };
  }
  
  console.log(`Mapped price ID ${priceId} to plan ${plan.planId} with ${plan.eventsQuota} events quota`)
  return plan;
}