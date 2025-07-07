import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (request) => {
  const signature = request.headers.get('Stripe-Signature')
  const body = await request.text()
  
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || '',
      undefined,
      cryptoProvider
    )

    console.log(`Received event: ${event.type}`)

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
        
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(`Webhook error: ${error.message}`, { status: 400 })
  }
})

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Try to get userId from client_reference_id first, then fallback to metadata
  let userId = session.client_reference_id || session.metadata?.user_id
  
  if (!userId) {
    console.error('No user_id in session client_reference_id or metadata')
    
    // Try to get userId from customer if available
    if (session.customer) {
      try {
        const { data: customerData } = await supabaseClient
          .from('stripe_customers')
          .select('user_id')
          .eq('id', session.customer)
          .single()
          
        if (customerData?.user_id) {
          userId = customerData.user_id
          console.log(`Retrieved user_id ${userId} from customer ${session.customer}`)
        }
      } catch (error) {
        console.error('Error retrieving user_id from customer:', error)
      }
    }
    
    if (!userId) {
      console.error('Could not determine user_id for checkout session')
      return
    }
  }

  try {
    // Store customer in stripe_customers table if it doesn't exist
    const { data: existingCustomer } = await supabaseClient
      .from('stripe_customers')
      .select('id')
      .eq('id', session.customer as string)
      .single()
      
    if (!existingCustomer) {
      await supabaseClient
        .from('stripe_customers')
        .insert({
          id: session.customer as string,
          user_id: userId,
          email: session.customer_details?.email || '',
          name: session.customer_details?.name || '',
          created_at: new Date().toISOString()
        })
    }
    
    // Update user's subscription status
    const { error } = await supabaseClient
      .from('users')
      .update({
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user subscription:', error)
    }
  } catch (error) {
    console.error('Error in handleCheckoutCompleted:', error)
  }
}

async function handleCustomerCreated(customer: Stripe.Customer) {
  let userId = customer.metadata?.user_id
  
  if (!userId) {
    console.error('No user_id in customer metadata, checking client_reference_id')
    
    // Try to get userId from the most recent checkout session for this customer
    try {
      const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
        apiVersion: '2023-10-16',
      })
      
      const sessions = await stripe.checkout.sessions.list({
        customer: customer.id,
        limit: 1
      })
      
      if (sessions.data.length > 0) {
        userId = sessions.data[0].client_reference_id
        console.log(`Retrieved user_id ${userId} from checkout session`)
      }
    } catch (error) {
      console.error('Error retrieving checkout sessions:', error)
    }
    
    if (!userId) {
      console.error('Could not determine user_id for customer')
      return
    }
  }

  try {
    // Store customer in stripe_customers table
    const { error } = await supabaseClient
      .from('stripe_customers')
      .insert({
        id: customer.id,
        user_id: userId,
        email: customer.email || '',
        name: customer.name || '',
      })

    if (error) {
      console.error('Error storing customer:', error)
    }
    
    // Update user record with customer ID
    const { error: userError } = await supabaseClient
      .from('users')
      .update({
        stripe_customer_id: customer.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      
    if (userError) {
      console.error('Error updating user with customer ID:', userError)
    }
  } catch (error) {
    console.error('Error in handleCustomerCreated:', error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  let userId = subscription.metadata?.user_id
  
  if (!userId) {
    console.error('No user_id in subscription metadata, checking customer')
    
    // Try to get userId from the customer
    try {
      const { data: customerData } = await supabaseClient
        .from('stripe_customers')
        .select('user_id')
        .eq('id', subscription.customer)
        .single()
        
      if (customerData?.user_id) {
        userId = customerData.user_id
        console.log(`Retrieved user_id ${userId} from customer ${subscription.customer}`)
      }
    } catch (error) {
      console.error('Error retrieving user_id from customer:', error)
    }
    
    if (!userId) {
      console.error('Could not determine user_id for subscription')
      return
    }
  }

  // Get plan details from price ID
  const priceId = subscription.items.data[0]?.price.id
  const planDetails = getPlanDetailsByPriceId(priceId)

  try {
    // Store subscription in stripe_subscriptions table
    await supabaseClient
      .from('stripe_subscriptions')
      .insert({
        id: subscription.id,
        customer_id: subscription.customer as string,
        user_id: userId,
        status: subscription.status,
        price_id: priceId,
        quantity: subscription.items.data[0]?.quantity || 1,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      })

    // Update user subscription info
    const { error } = await supabaseClient
      .from('users')
      .update({
        stripe_subscription_id: subscription.id,
        stripe_subscription_status: subscription.status,
        stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        subscription_status: subscription.status === 'active' ? 'active' : 'inactive',
        subscription_events_quota: planDetails.eventsQuota,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating subscription:', error)
    }
  } catch (error) {
    console.error('Error in handleSubscriptionCreated:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id
  
  if (!userId) {
    console.error('No user_id in subscription metadata')
    return
  }

  // Get plan details from price ID
  const priceId = subscription.items.data[0]?.price.id
  const planDetails = getPlanDetailsByPriceId(priceId)

  // Update subscription in stripe_subscriptions table
  await supabaseClient
    .from('stripe_subscriptions')
    .update({
      status: subscription.status,
      price_id: priceId,
      quantity: subscription.items.data[0]?.quantity || 1,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscription.id)

  // Update user subscription info
  const { error } = await supabaseClient
    .from('users')
    .update({
      stripe_subscription_status: subscription.status,
      stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      subscription_status: subscription.status === 'active' ? 'active' : 'inactive',
      subscription_events_quota: planDetails.eventsQuota,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating subscription:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id
  
  if (!userId) {
    console.error('No user_id in subscription metadata')
    return
  }

  // Update subscription status
  await supabaseClient
    .from('stripe_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscription.id)

  // Update user subscription info
  const { error } = await supabaseClient
    .from('users')
    .update({
      stripe_subscription_status: 'canceled',
      subscription_status: 'inactive',
      subscription_events_quota: 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating subscription:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  
  try {
    // Get user ID from customer
    const { data: customer, error: customerError } = await supabaseClient
      .from('stripe_customers')
      .select('user_id')
      .eq('id', customerId)
      .single()

    if (customerError || !customer) {
      console.error('Customer not found for invoice:', customerError)
      return
    }

    // Store invoice
    await supabaseClient
      .from('stripe_invoices')
      .insert({
        id: invoice.id,
        customer_id: customerId,
        subscription_id: invoice.subscription as string || null,
        user_id: customer.user_id,
        amount_paid: invoice.amount_paid,
        amount_due: invoice.amount_due,
        currency: invoice.currency,
        status: invoice.status || 'paid',
        hosted_invoice_url: invoice.hosted_invoice_url,
        invoice_pdf: invoice.invoice_pdf,
      })

    // Reset events used count for new billing period
    const { error } = await supabaseClient
      .from('users')
      .update({
        subscription_events_used: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customer.user_id)

    if (error) {
      console.error('Error resetting events count:', error)
    }
  } catch (error) {
    console.error('Error in handlePaymentSucceeded:', error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  
  // Get user ID from customer
  const { data: customer } = await supabaseClient
    .from('stripe_customers')
    .select('user_id')
    .eq('id', customerId)
    .single()

  if (!customer) {
    console.error('Customer not found for failed payment')
    return
  }

  // Store failed invoice
  await supabaseClient
    .from('stripe_invoices')
    .insert({
      id: invoice.id,
      customer_id: customerId,
      subscription_id: invoice.subscription as string || null,
      user_id: customer.user_id,
      amount_paid: invoice.amount_paid,
      amount_due: invoice.amount_due,
      currency: invoice.currency,
      status: invoice.status || 'open',
      hosted_invoice_url: invoice.hosted_invoice_url,
      invoice_pdf: invoice.invoice_pdf,
    })

  console.log(`Payment failed for user ${customer.user_id}`)
}

async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
  const customerId = paymentMethod.customer as string
  
  try {
    if (!customerId) {
      console.error('No customer ID in payment method')
      return
    }

    // Get user ID from customer
    const { data: customer, error: customerError } = await supabaseClient
      .from('stripe_customers')
      .select('user_id')
      .eq('id', customerId)
      .single()

    if (customerError || !customer) {
      console.error('Customer not found for payment method:', customerError)
      return
    }

    // Store payment method
    await supabaseClient
      .from('stripe_payment_methods')
      .insert({
        id: paymentMethod.id,
        customer_id: customerId,
        user_id: customer.user_id,
        type: paymentMethod.type,
        card_brand: paymentMethod.card?.brand,
        card_last4: paymentMethod.card?.last4,
        card_exp_month: paymentMethod.card?.exp_month,
        card_exp_year: paymentMethod.card?.exp_year,
      })
  } catch (error) {
    console.error('Error in handlePaymentMethodAttached:', error)
  }
}

async function handlePaymentMethodDetached(paymentMethod: Stripe.PaymentMethod) {
  // Remove payment method from database
  await supabaseClient
    .from('stripe_payment_methods')
    .delete()
    .eq('id', paymentMethod.id)
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    // Try to get userId from client_reference_id first, then fallback to metadata
    let userId = session.client_reference_id || session.metadata?.user_id
    
    // Check if this is a featured demo purchase
    if (session.success_url?.includes('feature=featured_demo') && session.success_url?.includes('demoId=')) {
      // Extract the demo ID from the success URL
      const demoIdMatch = session.success_url.match(/demoId=([^&]+)/);
      if (demoIdMatch && demoIdMatch[1]) {
        const demoId = demoIdMatch[1];
        
        // Update the demo to be featured
        const { error } = await supabaseClient
          .from('demos')
          .update({
            is_featured: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', demoId);
          
        if (error) {
          console.error('Error updating demo featured status:', error);
        } else {
          console.log(`Demo ${demoId} marked as featured`);
        }
      }
    }
    
    // Check if this is a subscription purchase
    if (session.mode === 'subscription') {
      if (!userId) {
        console.error('No user_id found in session for subscription purchase')
        
        // Try to get userId from customer if available
        if (session.customer) {
          try {
            const { data: customerData } = await supabaseClient
              .from('stripe_customers')
              .select('user_id')
              .eq('id', session.customer)
              .single()
              
            if (customerData?.user_id) {
              userId = customerData.user_id
              console.log(`Retrieved user_id ${userId} from customer ${session.customer}`)
            }
          } catch (error) {
            console.error('Error retrieving user_id from customer:', error)
          }
        }
        
        if (!userId) {
          console.error('Could not determine user_id for subscription')
          return
        }
      }
      
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;
      
      // Get subscription details
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0]?.price.id;
      
      // Get plan details from price ID
      const planDetails = getPlanDetailsByPriceId(priceId);
      
      // Store customer in stripe_customers table if it doesn't exist
      const { data: existingCustomer } = await supabaseClient
        .from('stripe_customers')
        .select('id')
        .eq('id', customerId)
        .single()
        
      if (!existingCustomer) {
        await supabaseClient
          .from('stripe_customers')
          .insert({
            id: customerId,
            user_id: userId,
            email: session.customer_details?.email || '',
            name: session.customer_details?.name || '',
            created_at: new Date().toISOString()
          })
      }
      
      // Store subscription in stripe_subscriptions table
      await supabaseClient
        .from('stripe_subscriptions')
        .insert({
          id: subscriptionId,
          customer_id: customerId,
          user_id: userId,
          status: subscription.status,
          price_id: priceId,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        })
        .on_conflict('id')
        .merge()
      
      // Update user's subscription status
      const { error } = await supabaseClient
        .from('users')
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status: 'active',
          subscription_events_quota: planDetails.eventsQuota,
          subscription_events_used: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (error) {
        console.error('Error updating user subscription:', error);
      } else {
        console.log(`User ${userId} subscription activated`);
      }
    }
  } catch (error) {
    console.error('Error in handleCheckoutSessionCompleted:', error)
  }
}

function getPlanDetailsByPriceId(priceId: string): { planId: string; eventsQuota: number } {
  const planMapping: Record<string, { planId: string; eventsQuota: number }> = {
    'price_starter_monthly': { planId: 'starter', eventsQuota: 3 },
    'price_starter_monthly_annual': { planId: 'starter', eventsQuota: 3 },
    'price_professional_monthly': { planId: 'professional', eventsQuota: 8 },
    'price_professional_monthly_annual': { planId: 'professional', eventsQuota: 8 },
    'price_enterprise_monthly': { planId: 'enterprise', eventsQuota: 15 },
    'price_enterprise_monthly_annual': { planId: 'enterprise', eventsQuota: 15 },
    'price_team_monthly': { planId: 'team', eventsQuota: 10 },
    'price_team_monthly_annual': { planId: 'team', eventsQuota: 10 },
  }

  return planMapping[priceId] || { planId: 'starter', eventsQuota: 3 }
}