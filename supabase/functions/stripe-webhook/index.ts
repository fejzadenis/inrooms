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
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
      subscription_status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user subscription:', error)
  }
}

async function handleCustomerCreated(customer: Stripe.Customer) {
  const userId = customer.metadata?.user_id
  
  if (!userId) {
    console.error('No user_id in customer metadata')
    return
  }

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
  
  // Get user ID from customer
  const { data: customer } = await supabaseClient
    .from('stripe_customers')
    .select('user_id')
    .eq('id', customerId)
    .single()

  if (!customer) {
    console.error('Customer not found for invoice')
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
  
  if (!customerId) {
    console.error('No customer ID in payment method')
    return
  }

  // Get user ID from customer
  const { data: customer } = await supabaseClient
    .from('stripe_customers')
    .select('user_id')
    .eq('id', customerId)
    .single()

  if (!customer) {
    console.error('Customer not found for payment method')
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
}

async function handlePaymentMethodDetached(paymentMethod: Stripe.PaymentMethod) {
  // Remove payment method from database
  await supabaseClient
    .from('stripe_payment_methods')
    .delete()
    .eq('id', paymentMethod.id)
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