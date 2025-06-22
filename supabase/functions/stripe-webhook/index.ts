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
  const userId = session.metadata?.user_id
  
  if (!userId) {
    console.error('No user_id in session metadata')
    return
  }

  // Update user's subscription status
  const { error } = await supabaseClient
    .from('users')
    .update({
      'subscription.status': 'active',
      'subscription.stripe_customer_id': session.customer,
      'subscription.stripe_subscription_id': session.subscription,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user subscription:', error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id
  
  if (!userId) {
    console.error('No user_id in subscription metadata')
    return
  }

  // Get plan details from price ID
  const priceId = subscription.items.data[0]?.price.id
  const planDetails = getPlanDetailsByPriceId(priceId)

  const { error } = await supabaseClient
    .from('users')
    .update({
      'subscription.status': subscription.status === 'active' ? 'active' : 'inactive',
      'subscription.stripe_subscription_id': subscription.id,
      'subscription.current_period_start': new Date(subscription.current_period_start * 1000).toISOString(),
      'subscription.current_period_end': new Date(subscription.current_period_end * 1000).toISOString(),
      'subscription.events_quota': planDetails.eventsQuota,
      'subscription.plan_id': planDetails.planId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating subscription:', error)
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

  const { error } = await supabaseClient
    .from('users')
    .update({
      'subscription.status': subscription.status === 'active' ? 'active' : 'inactive',
      'subscription.current_period_start': new Date(subscription.current_period_start * 1000).toISOString(),
      'subscription.current_period_end': new Date(subscription.current_period_end * 1000).toISOString(),
      'subscription.events_quota': planDetails.eventsQuota,
      'subscription.plan_id': planDetails.planId,
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

  const { error } = await supabaseClient
    .from('users')
    .update({
      'subscription.status': 'inactive',
      'subscription.events_quota': 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating subscription:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const userId = invoice.subscription_details?.metadata?.user_id
  
  if (!userId) {
    console.error('No user_id in invoice metadata')
    return
  }

  // Reset events used count for new billing period
  const { error } = await supabaseClient
    .from('users')
    .update({
      'subscription.events_used': 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('Error resetting events count:', error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const userId = invoice.subscription_details?.metadata?.user_id
  
  if (!userId) {
    console.error('No user_id in invoice metadata')
    return
  }

  // Optionally handle payment failures (e.g., send notification)
  console.log(`Payment failed for user ${userId}`)
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