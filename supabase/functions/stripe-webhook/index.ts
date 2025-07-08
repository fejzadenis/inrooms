import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

// Initialize Stripe with the secret key
// Initialize Stripe with the secret key
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

// Initialize Supabase client
// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const cryptoProvider = Stripe.createSubtleCryptoProvider()

// Log webhook initialization
console.log('Webhook endpoint initialized with:');
console.log(`- Supabase URL: ${Deno.env.get('SUPABASE_URL') ? 'Set' : 'Not set'}`);
console.log(`- Stripe Secret Key: ${Deno.env.get('STRIPE_SECRET_KEY') ? 'Set' : 'Not set'}`);
console.log(`- Webhook Secret: ${Deno.env.get('STRIPE_WEBHOOK_SECRET') ? 'Set' : 'Not set'}`);

// Log configuration for debugging
console.log('Webhook endpoint initialized with:')
console.log(`- Supabase URL: ${Deno.env.get('SUPABASE_URL') ? 'Set' : 'Not set'}`)
console.log(`- Stripe Secret Key: ${Deno.env.get('STRIPE_SECRET_KEY') ? 'Set' : 'Not set'}`)
console.log(`- Webhook Secret: ${Deno.env.get('STRIPE_WEBHOOK_SECRET') ? 'Set' : 'Not set'}`)

serve(async (request) => {
  const signature = request.headers.get('Stripe-Signature')
  const body = await request.text()
  
  if (!signature) {
    console.error('No Stripe-Signature header found')
    return new Response(JSON.stringify({ error: 'No Stripe-Signature header found' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    console.log(`Attempting to verify webhook signature: ${signature.substring(0, 20)}...`);
    
    })
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
    
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    )

    console.log(`✅ Received valid event: ${event.type}`);
    console.log(`Handling ${event.type} event`);

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
    console.error('❌ Webhook error:', error)
    return new Response(JSON.stringify({ 
      error: 'Webhook error',
      message: error.message
    }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Try to get userId from client_reference_id first, then fallback to metadata
  let userId = session.client_reference_id || session.metadata?.user_id;
  
  console.log('Handling checkout.session.completed event');
  
  console.log('Handling checkout.session.completed event')
  console.log(`- Session ID: ${session.id}`)
  console.log(`- Client Reference ID: ${session.client_reference_id || 'Not set'}`)
  console.log(`- Metadata:`, session.metadata)
  console.log(`- Customer: ${session.customer || 'Not set'}`)
  
  if (!userId) {
    console.error('No user_id in session client_reference_id or metadata, attempting to find from customer');
    console.log(`- Client Reference ID: ${session.client_reference_id ? session.client_reference_id : 'Not set'}`);
    console.log(`- Metadata: ${JSON.stringify(session.metadata || {})}`);
    console.log(`- Customer: ${session.customer ? session.customer : 'Not set'}`);
    
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
          console.log(`Retrieved user_id ${userId} from customer ${session.customer}`);
        } else {
          console.warn(`No user_id found for customer ${session.customer}`)
        }
      } catch (error) {
        console.error('Error retrieving user_id from customer:', error);
      }
    }
    
    if (!userId) {
      console.error('❌ Could not determine user_id for checkout session');
      
      // Create a placeholder user ID based on email if available
      if (session.customer_details?.email) {
        const email = session.customer_details.email;
        console.log(`Creating placeholder user ID from email: ${email}`);
        userId = `placeholder_${Date.now()}`;
        console.log(`Generated placeholder ID: ${userId}`);
      } else {
        console.error('No email available to create placeholder ID');
        return;
      }
      
      console.log('❌ Could not determine user_id for checkout session, creating placeholder');
      // Create a placeholder user ID based on customer email if available
      if (session.customer_details?.email) {
        const email = session.customer_details.email
        console.log(`Creating placeholder user ID from email: ${email}`)
        
        // Check if a user with this email already exists
        const { data: existingUser } = await supabaseClient
          .from('users')
          .select('id')
          .eq('email', email)
          .single()
          
        if (existingUser) {
          userId = existingUser.id
          console.log(`Found existing user with email ${email}, ID: ${userId}`)
        } else {
          // Generate a placeholder ID
          userId = `placeholder_${Date.now()}`
          console.log(`Generated placeholder ID: ${userId}`)
        }
      } else {
        console.error('No email available, cannot process checkout session')
        return
      }
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
        console.log(`Creating new customer record for ${session.customer}`);
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
        console.error('❌ Error updating user subscription:', error)
      } else {
        console.log(`✅ Updated user ${userId} with customer ${session.customer}`);
      }
          metadata: {
            checkout_session_id: session.id,
            client_reference_id: session.client_reference_id
          }
        })
    } else {
      console.log(`Customer ${session.customer} already exists, linked to user ${existingCustomer.user_id}`)
    }
    }
    console.error('❌ Error in handleCheckoutCompleted:', error)
    console.error('❌ Error in handleCheckoutCompleted:', error)
  }
}

async function handleCustomerCreated(customer: Stripe.Customer) {
  let userId = customer.metadata?.user_id
  
  console.log('Handling customer.created event')
  console.log(`- Customer ID: ${customer.id}`)
  console.log(`- Email: ${customer.email || 'Not set'}`)
  console.log(`- Metadata:`, customer.metadata)
  
  if (!userId) {
    console.warn('No user_id in customer metadata, checking recent checkout sessions')
    
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
        console.log(`✅ Retrieved user_id ${userId} from checkout session`)
      }
    } catch (error) {
      console.error('Error retrieving checkout sessions:', error)
    }
    
    if (!userId) {
      console.warn('Could not determine user_id from checkout sessions, checking by email')
      
      // Try to find user by email
      if (customer.email) {
        const { data: userByEmail } = await supabaseClient
          .from('users')
          .select('id')
          .eq('email', customer.email)
          .single()
          
        if (userByEmail) {
          userId = userByEmail.id
          console.log(`✅ Found user ${userId} by email ${customer.email}`)
        } else {
          console.error(`❌ No user found with email ${customer.email}`)
          return
        }
      } else {
        console.error('❌ No email available and no user ID, cannot process customer')
        return
      }
    }
  }

  try {
    // Store customer in stripe_customers table
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
      })

    if (error) {
      console.error('❌ Error storing customer:', error)
    } else {
      console.log(`✅ Stored customer ${customer.id} for user ${userId}`)
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
      console.error('❌ Error updating user with customer ID:', userError)
    } else {
      console.log(`✅ Updated user ${userId} with customer ID ${customer.id}`)
    }
  } catch (error) {
    console.error('❌ Error in handleCustomerCreated:', error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  let userId = subscription.metadata?.user_id
  
  console.log('Handling customer.subscription.created event')
  console.log(`- Subscription ID: ${subscription.id}`)
  console.log(`- Customer: ${subscription.customer}`)
  console.log(`- Status: ${subscription.status}`)
  console.log(`- Metadata:`, subscription.metadata)
  
  if (!userId) {
    console.warn('No user_id in subscription metadata, checking customer')
    
    // Try to get userId from the customer
    try {
      const { data: customerData } = await supabaseClient
        .from('stripe_customers')
        .select('user_id')
        .eq('id', subscription.customer)
        .single()
        
      if (customerData?.user_id) {
        userId = customerData.user_id
        console.log(`✅ Retrieved user_id ${userId} from customer ${subscription.customer}`)
      } else {
        console.warn(`No user_id found for customer ${subscription.customer}`)
      }
    } catch (error) {
      console.error('Error retrieving user_id from customer:', error)
    }
    
    if (!userId) {
      console.error('❌ Could not determine user_id for subscription, creating placeholder')
      userId = `placeholder_${Date.now()}`
    }
  }

  // Get plan details from price ID
  const priceId = subscription.items.data[0]?.price.id
  const planDetails = getPlanDetailsByPriceId(priceId)

  try {
    // Store subscription in stripe_subscriptions table
    const { error: subscriptionError } = await supabaseClient
      .from('stripe_subscriptions')
      .upsert({
        id: subscription.id,
        customer_id: subscription.customer as string,
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
      })
      
    if (subscriptionError) {
      console.error('❌ Error storing subscription:', subscriptionError)
    } else {
      console.log(`✅ Stored subscription ${subscription.id} for user ${userId}`)
    }

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
      console.error('❌ Error updating user subscription info:', error)
    } else {
      console.log(`✅ Updated user ${userId} with subscription info`)
    }
  } catch (error) {
    console.error('❌ Error in handleSubscriptionCreated:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  let userId = subscription.metadata?.user_id
  
  console.log('Handling customer.subscription.updated event')
  console.log(`- Subscription ID: ${subscription.id}`)
  console.log(`- Customer: ${subscription.customer}`)
  console.log(`- Status: ${subscription.status}`)
  console.log(`- Metadata:`, subscription.metadata)
  
  if (!userId) {
    console.warn('No user_id in subscription metadata, checking customer')
    
    // Try to get userId from the customer
    try {
      const { data: customerData } = await supabaseClient
        .from('stripe_customers')
        .select('user_id')
        .eq('id', subscription.customer)
        .single()
        
      if (customerData?.user_id) {
        userId = customerData.user_id
        console.log(`✅ Retrieved user_id ${userId} from customer ${subscription.customer}`)
      } else {
        console.warn(`No user_id found for customer ${subscription.customer}`)
        
        // Try to find subscription in database
        const { data: existingSubscription } = await supabaseClient
          .from('stripe_subscriptions')
          .select('user_id')
          .eq('id', subscription.id)
          .single()
          
        if (existingSubscription?.user_id) {
          userId = existingSubscription.user_id
          console.log(`✅ Found user_id ${userId} from existing subscription record`)
        } else {
          console.error('❌ Could not determine user_id for subscription update')
          return
        }
      }
    } catch (error) {
      console.error('Error retrieving user_id for subscription update:', error)
      return
    }
  }

  // Get plan details from price ID
  const priceId = subscription.items.data[0]?.price.id
  const planDetails = getPlanDetailsByPriceId(priceId)

  // Update subscription in stripe_subscriptions table
  const { error: updateError } = await supabaseClient
    .from('stripe_subscriptions')
    .update({
      status: subscription.status,
      price_id: priceId,
      quantity: subscription.items.data[0]?.quantity || 1,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      metadata: subscription.metadata || {},
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscription.id)
    
  if (updateError) {
    console.error('❌ Error updating subscription record:', updateError)
  } else {
    console.log(`✅ Updated subscription record ${subscription.id}`)
  }

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
    console.error('❌ Error updating user subscription info:', error)
  } else {
    console.log(`✅ Updated user ${userId} with subscription status ${subscription.status}`)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  let userId = subscription.metadata?.user_id
  
  console.log('Handling customer.subscription.deleted event')
  console.log(`- Subscription ID: ${subscription.id}`)
  console.log(`- Customer: ${subscription.customer}`)
  console.log(`- Metadata:`, subscription.metadata)
  
  if (!userId) {
    console.warn('No user_id in subscription metadata, checking database')
    
    // Try to find subscription in database
    try {
      const { data: existingSubscription } = await supabaseClient
        .from('stripe_subscriptions')
        .select('user_id')
        .eq('id', subscription.id)
        .single()
        
      if (existingSubscription?.user_id) {
        userId = existingSubscription.user_id
        console.log(`✅ Found user_id ${userId} from existing subscription record`)
      } else {
        console.error('❌ Could not determine user_id for subscription deletion')
        return
      }
    } catch (error) {
      console.error('Error retrieving user_id for subscription deletion:', error)
      return
    }
  }

  // Update subscription status
  const { error: updateError } = await supabaseClient
    .from('stripe_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscription.id)
    
  if (updateError) {
    console.error('❌ Error updating subscription status:', updateError)
  } else {
    console.log(`✅ Updated subscription ${subscription.id} status to canceled`)
  }

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
    console.error('❌ Error updating user subscription status:', error)
  } else {
    console.log(`✅ Updated user ${userId} subscription status to inactive`)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  
  console.log('Handling invoice.payment_succeeded event')
  console.log(`- Invoice ID: ${invoice.id}`)
  console.log(`- Customer: ${customerId}`)
  console.log(`- Subscription: ${invoice.subscription || 'None'}`)
  
  try {
    // Get user ID from customer
    const { data: customer, error: customerError } = await supabaseClient 
      .from('stripe_customers')
      .select('user_id')
      .eq('id', customerId)
      .single()

    if (customerError || !customer) {
      console.error('❌ Customer not found for invoice:', customerError)
      
      // Try to find customer in Stripe
      try {
        const stripeCustomer = await stripe.customers.retrieve(customerId)
        if (typeof stripeCustomer !== 'string' && stripeCustomer.email) {
          // Try to find user by email
          const { data: userByEmail } = await supabaseClient
            .from('users')
            .select('id')
            .eq('email', stripeCustomer.email)
            .single()
            
          if (userByEmail) {
            // Create customer record
            await supabaseClient
              .from('stripe_customers')
              .insert({
                id: customerId,
                user_id: userByEmail.id,
                email: stripeCustomer.email,
                name: stripeCustomer.name || '',
                created_at: new Date().toISOString()
              })
              
            console.log(`✅ Created missing customer record for ${customerId} linked to user ${userByEmail.id}`)
            
            // Continue with this user ID
            customer = { user_id: userByEmail.id }
          } else {
            console.error(`❌ No user found with email ${stripeCustomer.email}`)
            return
          }
        } else {
          console.error('❌ Could not retrieve customer from Stripe')
          return
        }
      } catch (stripeError) {
        console.error('❌ Error retrieving customer from Stripe:', stripeError)
        return
      }
    }

    // Store invoice
    const { error: invoiceError } = await supabaseClient
      .from('stripe_invoices')
      .upsert({
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      
    if (invoiceError) {
      console.error('❌ Error storing invoice:', invoiceError)
    } else {
      console.log(`✅ Stored invoice ${invoice.id} for user ${customer.user_id}`)
    }

    // Reset events used count for new billing period
    const { error } = await supabaseClient
      .from('users')
      .update({
        subscription_events_used: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customer.user_id)

    if (error) {
      console.error('❌ Error resetting events count:', error)
    } else {
      console.log(`✅ Reset events used count for user ${customer.user_id}`)
    }
  } catch (error) {
    console.error('❌ Error in handlePaymentSucceeded:', error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  
  console.log('Handling invoice.payment_failed event')
  console.log(`- Invoice ID: ${invoice.id}`)
  console.log(`- Customer: ${customerId}`)
  
  // Get user ID from customer
  const { data: customer, error: customerError } = await supabaseClient
    .from('stripe_customers')
    .select('user_id')
    .eq('id', customerId)
    .single()

  if (customerError || !customer) {
    console.error('❌ Customer not found for failed payment:', customerError)
    return
  }

  // Store failed invoice
  const { error: invoiceError } = await supabaseClient
    .from('stripe_invoices')
    .upsert({
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    
  if (invoiceError) {
    console.error('❌ Error storing failed invoice:', invoiceError)
  } else {
    console.log(`✅ Stored failed invoice ${invoice.id} for user ${customer.user_id}`)
  }

  // Update user subscription status to reflect payment failure
  const { error: userError } = await supabaseClient
    .from('users')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('id', customer.user_id)
    
  if (userError) {
    console.error('❌ Error updating user subscription status:', userError)
  } else {
    console.log(`✅ Updated user ${customer.user_id} subscription status to past_due`)
  }
}

async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
  const customerId = paymentMethod.customer as string
  
  console.log('Handling payment_method.attached event')
  console.log(`- Payment Method ID: ${paymentMethod.id}`)
  console.log(`- Customer: ${customerId}`)
  
  try {
    if (!customerId) {
      console.error('❌ No customer ID in payment method')
      return
    }

    // Get user ID from customer
    const { data: customer, error: customerError } = await supabaseClient
      .from('stripe_customers')
      .select('*')
      .eq('id', customerId)
      .single()

    if (customerError || !customer) {
      console.error('❌ Customer not found for payment method:', customerError)
      
      // Try to find customer in Stripe
      try {
        const stripeCustomer = await stripe.customers.retrieve(customerId)
        if (typeof stripeCustomer !== 'string' && stripeCustomer.email) {
          // Try to find user by email
          const { data: userByEmail } = await supabaseClient
            .from('users')
            .select('id')
            .eq('email', stripeCustomer.email)
            .single()
            
          if (userByEmail) {
            // Create customer record
            await supabaseClient
              .from('stripe_customers')
              .insert({
                id: customerId,
                user_id: userByEmail.id,
                email: stripeCustomer.email,
                name: stripeCustomer.name || '',
                created_at: new Date().toISOString()
              })
              
            console.log(`✅ Created missing customer record for ${customerId}`)
            
            // Continue with this user ID
            customer = { user_id: userByEmail.id }
          } else {
            console.error(`❌ No user found with email ${stripeCustomer.email}`)
            return
          }
        } else {
          console.error('❌ Could not retrieve customer from Stripe')
          return
        }
      } catch (stripeError) {
        console.error('❌ Error retrieving customer from Stripe:', stripeError)
        return
      }
    }

    // Store payment method
    const { error: paymentMethodError } = await supabaseClient
      .from('stripe_payment_methods')
      .upsert({
        id: paymentMethod.id,
        customer_id: customerId,
        user_id: customer.user_id,
        type: paymentMethod.type,
        card_brand: paymentMethod.card?.brand,
        card_last4: paymentMethod.card?.last4,
        card_exp_month: paymentMethod.card?.exp_month,
        card_exp_year: paymentMethod.card?.exp_year,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      
    if (paymentMethodError) {
      console.error('❌ Error storing payment method:', paymentMethodError)
    } else {
      console.log(`✅ Stored payment method ${paymentMethod.id} for user ${customer.user_id}`)
    }
    
    // If this is the first payment method, set it as default
    if (!customer.default_payment_method) {
      const { error: updateError } = await supabaseClient
        .from('stripe_customers')
        .update({
          default_payment_method: paymentMethod.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId)
        
      if (updateError) {
        console.error('❌ Error setting default payment method:', updateError)
      } else {
        console.log(`✅ Set ${paymentMethod.id} as default payment method for customer ${customerId}`)
      }
    }
  } catch (error) {
    console.error('❌ Error in handlePaymentMethodAttached:', error)
  }
}

async function handlePaymentMethodDetached(paymentMethod: Stripe.PaymentMethod) {
  console.log('Handling payment_method.detached event')
  console.log(`- Payment Method ID: ${paymentMethod.id}`)
  
  // Remove payment method from database
  const { error } = await supabaseClient
    .from('stripe_payment_methods')
    .delete()
    .eq('id', paymentMethod.id)
    
  if (error) {
    console.error('❌ Error deleting payment method:', error)
  } else {
    console.log(`✅ Deleted payment method ${paymentMethod.id}`)
  }
  
  // Check if this was a default payment method for any customer
  const { data: customers, error: customerError } = await supabaseClient
    .from('stripe_customers')
    .select('id')
    .eq('default_payment_method', paymentMethod.id)
    
  if (customerError) {
    console.error('❌ Error checking for customers using this payment method:', customerError)
  } else if (customers && customers.length > 0) {
    // Update customers to remove this as default payment method
    for (const customer of customers) {
      const { error: updateError } = await supabaseClient
        .from('stripe_customers')
        .update({
          default_payment_method: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', customer.id)
        
      if (updateError) {
        console.error(`❌ Error updating customer ${customer.id} default payment method:`, updateError)
      } else {
        console.log(`✅ Removed ${paymentMethod.id} as default payment method for customer ${customer.id}`)
      }
    }
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    // Try to get userId from client_reference_id first, then fallback to metadata
    let userId = session.client_reference_id || session.metadata?.user_id
    
    console.log('Handling checkout.session.completed event (detailed)')
    console.log(`- Session ID: ${session.id}`)
    console.log(`- Client Reference ID: ${session.client_reference_id || 'Not set'}`)
    console.log(`- Metadata:`, session.metadata)
    console.log(`- Customer: ${session.customer || 'Not set'}`)
    console.log(`- Subscription: ${session.subscription || 'Not set'}`)
    console.log(`- Mode: ${session.mode}`)
    
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
          console.error('❌ Error updating demo featured status:', error);
        } else {
          console.log(`✅ Demo ${demoId} marked as featured`);
        }
      }
    }
    
    // Check if this is a subscription purchase
    if (session.mode === 'subscription') {
      if (!userId) {
        console.warn('No user_id found in session for subscription purchase, checking customer')
        
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
              console.log(`✅ Retrieved user_id ${userId} from customer ${session.customer}`)
            } else {
              console.warn(`No user_id found for customer ${session.customer}`)
            }
          } catch (error) {
            console.error('Error retrieving user_id from customer:', error)
          }
        }
        
        if (!userId) {
          console.error('❌ Could not determine user_id for subscription, checking email')
          
          // Try to find user by email
          if (session.customer_details?.email) {
            const { data: userByEmail } = await supabaseClient
              .from('users')
              .select('id')
              .eq('email', session.customer_details.email)
              .single()
              
            if (userByEmail) {
              userId = userByEmail.id
              console.log(`✅ Found user ${userId} by email ${session.customer_details.email}`)
            } else {
              console.error(`❌ No user found with email ${session.customer_details.email}`)
              return
            }
          } else {
            console.error('❌ No email available, cannot process subscription')
            return
          }
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
        .select('*')
        .eq('id', customerId)
        .single()
        
      if (!existingCustomer) {
        console.log(`Creating new customer record for ${customerId}`)
        await supabaseClient
          .from('stripe_customers')
          .upsert({
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
          })
      } else {
        console.log(`Customer ${customerId} already exists, linked to user ${existingCustomer.user_id}`)
      }
      
      // Store subscription in stripe_subscriptions table
      const { error: subscriptionError } = await supabaseClient
        .from('stripe_subscriptions')
        .upsert({
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
        })
        
      if (subscriptionError) {
        console.error('❌ Error storing subscription:', subscriptionError)
      } else {
        console.log(`✅ Stored subscription ${subscriptionId} for user ${userId}`)
      }
      
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
        console.error('❌ Error updating user subscription:', error);
      } else {
        console.log(`✅ User ${userId} subscription activated with plan ${planDetails.planId}`);
      }
    }
  } catch (error) {
    console.error('❌ Error in handleCheckoutSessionCompleted:', error)
  }
}

function getPlanDetailsByPriceId(priceId: string): { planId: string; eventsQuota: number } {
  const planMapping: Record<string, { planId: string; eventsQuota: number }> = {
    // Test mode price IDs
    'price_starter_monthly': { planId: 'starter', eventsQuota: 3 },
    'price_professional_monthly': { planId: 'professional', eventsQuota: 8 },
    'price_enterprise_monthly': { planId: 'enterprise', eventsQuota: 15 },
    'price_team_monthly': { planId: 'team', eventsQuota: 10 },
    
    // Annual plans
    'price_starter_annual': { planId: 'starter_annual', eventsQuota: 3 },
    'price_professional_annual': { planId: 'professional_annual', eventsQuota: 8 },
    'price_enterprise_annual': { planId: 'enterprise_annual', eventsQuota: 15 },
    'price_team_annual': { planId: 'team_annual', eventsQuota: 10 },
    
    // Live mode price IDs (if different)
    'price_1RiPwAGCopIxkzs6Ck9VGWH2': { planId: 'starter', eventsQuota: 3 },
    'price_1RiPwAGCopIxkzs6ck9VGWH2': { planId: 'professional', eventsQuota: 8 },
    'price_1RiPwBGCopIxkzs6Ck9VGWH3': { planId: 'enterprise', eventsQuota: 15 },
    'price_1RiPwBGCopIxkzs6ck9VGWH3': { planId: 'team', eventsQuota: 10 },
  }

  const result = planMapping[priceId] || { planId: 'starter', eventsQuota: 3 }
  console.log(`Mapped price ID ${priceId} to plan ${result.planId} with ${result.eventsQuota} events quota`)
  return result
}