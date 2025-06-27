// Follow Deno and Supabase Edge Function conventions
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno';

// Initialize Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get the webhook signing secret from environment variables
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

serve(async (req) => {
  // Handle CORS for preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
      },
    });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get the request body and signature header
    const payload = await req.text();
    const signature = req.headers.get('Stripe-Signature');

    if (!signature) {
      return new Response(JSON.stringify({ error: 'Stripe signature missing' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Extract metadata
        const userId = session.metadata?.userId;
        
        if (!userId) {
          console.error('No userId found in session metadata');
          break;
        }
        
        // Get subscription details
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const plan = subscription.items.data[0].plan;
          
          // Determine the plan details based on the price ID
          let eventsQuota = 0;
          
          // In a real app, you would look up the plan details in your database
          // Here we're using a simple mapping
          if (plan.id.includes('starter')) {
            eventsQuota = 3;
          } else if (plan.id.includes('professional')) {
            eventsQuota = 8;
          } else if (plan.id.includes('enterprise')) {
            eventsQuota = 15;
          } else if (plan.id.includes('team')) {
            eventsQuota = 10;
          }
          
          // Update user subscription in Supabase
          const { error } = await supabase
            .from('users')
            .update({
              subscription: {
                status: 'active',
                stripe_subscription_id: subscription.id,
                stripe_price_id: plan.id,
                eventsQuota: eventsQuota,
                eventsUsed: 0,
                currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
              },
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
            
          if (error) {
            console.error('Error updating user subscription:', error);
          }
        }
        
        // Handle featured demo purchase if applicable
        if (session.metadata?.demoId && session.metadata?.featureType === 'featured_demo') {
          const demoId = session.metadata.demoId;
          
          // Update demo to be featured
          const { error } = await supabase
            .from('demos')
            .update({
              isFeatured: true,
              featuredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
              updated_at: new Date().toISOString(),
            })
            .eq('id', demoId);
            
          if (error) {
            console.error('Error updating demo featured status:', error);
          }
        }
        
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        const customerId = invoice.customer;
        
        if (subscriptionId) {
          // Get the customer's user ID from Supabase
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();
            
          if (userError) {
            console.error('Error fetching user:', userError);
            break;
          }
          
          const userId = userData.id;
          
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
          const plan = subscription.items.data[0].plan;
          
          // Determine the plan details based on the price ID
          let eventsQuota = 0;
          
          // In a real app, you would look up the plan details in your database
          if (plan.id.includes('starter')) {
            eventsQuota = 3;
          } else if (plan.id.includes('professional')) {
            eventsQuota = 8;
          } else if (plan.id.includes('enterprise')) {
            eventsQuota = 15;
          } else if (plan.id.includes('team')) {
            eventsQuota = 10;
          }
          
          // Update user subscription in Supabase
          const { error } = await supabase
            .from('users')
            .update({
              subscription: {
                status: 'active',
                stripe_subscription_id: subscription.id,
                stripe_price_id: plan.id,
                eventsQuota: eventsQuota,
                eventsUsed: 0, // Reset events used on renewal
                currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
              },
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
            
          if (error) {
            console.error('Error updating user subscription:', error);
          }
        }
        
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        // Get the customer's user ID from Supabase
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();
          
        if (userError) {
          console.error('Error fetching user:', userError);
          break;
        }
        
        const userId = userData.id;
        
        // Update subscription status in Supabase
        const { error } = await supabase
          .from('users')
          .update({
            subscription: {
              status: subscription.status,
              stripe_subscription_id: subscription.id,
              currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
          
        if (error) {
          console.error('Error updating user subscription status:', error);
        }
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        // Get the customer's user ID from Supabase
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();
          
        if (userError) {
          console.error('Error fetching user:', userError);
          break;
        }
        
        const userId = userData.id;
        
        // Update subscription status in Supabase
        const { error } = await supabase
          .from('users')
          .update({
            subscription: {
              status: 'canceled',
              stripe_subscription_id: null,
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
          
        if (error) {
          console.error('Error updating user subscription status:', error);
        }
        
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a success response
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});