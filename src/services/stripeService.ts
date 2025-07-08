import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Types for Stripe integration

// Types for Stripe integration

// Types for Stripe integration
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  isPopular?: boolean;
  isCustom?: boolean;
  stripePriceId: string;
  targetAudience: string;
  valueProposition: string;
  eventsQuota: number;
  paymentLink: string;
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  stripePriceId: string;
  icon: string;
  benefits: string[];
  paymentLink: string;
}

// Subscription plans data
const monthlyPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    interval: 'month',
    stripePriceId: 'price_starter_monthly',
    targetAudience: 'New to networking',
    valueProposition: 'Get started with essential networking tools',
    eventsQuota: 3,
    paymentLink: 'https://buy.stripe.com/test_starter_monthly',
    features: [
      '3 events per month',
      'Basic profile features',
      'Event recordings access',
      'Community support',
      'Mobile app access'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    interval: 'month',
    stripePriceId: 'price_professional_monthly',
    targetAudience: 'Active professionals',
    valueProposition: 'Accelerate your networking with advanced features',
    eventsQuota: 10,
    isPopular: true,
    paymentLink: 'https://buy.stripe.com/test_professional_monthly',
    features: [
      '10 events per month',
      'Advanced profile features',
      'Priority event access',
      'Direct messaging',
      'Event recordings',
      'Analytics dashboard',
      'Priority support'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 149,
    interval: 'month',
    stripePriceId: 'price_enterprise_monthly',
    targetAudience: 'Enterprise professionals',
    valueProposition: 'Maximum networking potential with premium features',
    eventsQuota: 25,
    paymentLink: 'https://buy.stripe.com/test_enterprise_monthly',
    features: [
      '25 events per month',
      'Premium profile features',
      'VIP event access',
      'Advanced analytics',
      'Custom integrations',
      'Dedicated account manager',
      '24/7 priority support',
      'White-label options'
    ]
  },
  {
    id: 'team',
    name: 'Team',
    price: 199,
    interval: 'month',
    stripePriceId: 'price_team_monthly',
    targetAudience: 'Teams & organizations',
    valueProposition: 'Collaborative networking for your entire team',
    eventsQuota: 50,
    paymentLink: 'https://buy.stripe.com/test_team_monthly',
    features: [
      '50 events per month (shared)',
      'Team management tools',
      'Bulk event registration',
      'Team analytics dashboard',
      'Shared contact database',
      'Admin controls',
      'Team training sessions',
      'Dedicated support'
    ]
  },
  {
    id: 'custom',
    name: 'Enterprise Custom',
    price: 0,
    interval: 'month',
    stripePriceId: 'price_custom',
    targetAudience: 'Large enterprises',
    valueProposition: 'Custom solution designed for your specific needs',
    eventsQuota: 999999,
    isCustom: true,
    paymentLink: '',
    features: [
      'Unlimited events',
      'Custom integrations',
      'Dedicated infrastructure',
      'Custom branding',
      'Advanced security',
      'SLA guarantees',
      'Custom training',
      'Dedicated success manager'
    ]
  }
];

// Annual plans (with 20% discount)
const annualPlans: SubscriptionPlan[] = monthlyPlans.map(plan => ({
  ...plan,
  id: `${plan.id}_annual`,
  interval: 'year' as const,
  price: Math.round(plan.price * 12 * 0.8), // 20% discount
  stripePriceId: `${plan.stripePriceId}_annual`,
  paymentLink: plan.paymentLink.replace('monthly', 'annual')
}));

// Add-ons data
const addOns: AddOn[] = [
  {
    id: 'premium_badge',
    name: 'Premium Profile Badge',
    description: 'Stand out with a verified premium badge',
    price: 29,
    stripePriceId: 'price_premium_badge',
    icon: 'crown',
    paymentLink: 'https://buy.stripe.com/test_premium_badge',
    benefits: [
      'Verified premium badge on profile',
      'Higher visibility in search results',
      'Priority in connection recommendations',
      'Exclusive premium member events'
    ]
  },
  {
    id: 'priority_support',
    name: 'Priority Support',
    description: 'Get help when you need it most',
    price: 19,
    stripePriceId: 'price_priority_support',
    icon: 'star',
    paymentLink: 'https://buy.stripe.com/test_priority_support',
    benefits: [
      '24/7 priority support access',
      'Dedicated support representative',
      'Phone support availability',
      'Faster response times (< 2 hours)'
    ]
  },
  {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Deep insights into your networking',
    price: 39,
    stripePriceId: 'price_advanced_analytics',
    icon: 'zap',
    paymentLink: 'https://buy.stripe.com/test_advanced_analytics',
    benefits: [
      'Detailed networking analytics',
      'ROI tracking and reporting',
      'Connection quality metrics',
      'Custom dashboard views',
      'Export capabilities'
    ]
  }
];

// Customer and subscription data for testing
const mockCustomers = {
  'cus_123456': {
    id: 'cus_123456',
    name: 'John Doe',
    email: 'john@example.com',
    paymentMethods: [
      {
        id: 'pm_123456',
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
          expMonth: 12,
          expYear: 2025
        },
        isDefault: true
      }
    ],
    subscriptions: [
      {
        id: 'sub_123456',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        plan: {
          id: 'professional',
          name: 'Professional',
          amount: 7900
        }
      }
    ],
    invoices: [
      {
        id: 'in_123456',
        date: new Date(),
        description: 'Professional Plan - Monthly',
        amount: 79,
        status: 'paid',
        downloadUrl: '#'
      }
    ]
  }
};

export const stripeService = {
  // Get monthly plans
  getMonthlyPlans: function(): SubscriptionPlan[] {
    return monthlyPlans;
  },

  // Get annual plans
  getAnnualPlans: function(): SubscriptionPlan[] {
    return annualPlans;
  },

  // Get add-ons
  getAddOns: function(): AddOn[] {
    return addOns;
  },

  // Calculate annual savings
  calculateAnnualSavings: function(monthlyPrice: number): number {
    const annualPrice = monthlyPrice * 12;
    const discountedAnnualPrice = annualPrice * 0.8; // 20% discount
    return Math.round(annualPrice - discountedAnnualPrice);
  },

  // Redirect to payment link
  redirectToPaymentLink: function(paymentLink: string): void {
    if (paymentLink) {
      window.location.href = paymentLink;
    } else {
      throw new Error('Payment link not available');
    }
  },

  // Create a checkout session
  createCheckoutSession: async function(data: {
    userId: string;
    userEmail: string; 
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    addOns?: string[];
    metadata?: Record<string, string>;
  }) {
    // In a real application, this would make a request to your backend
    // which would then create a Stripe checkout session    
    console.log('Creating checkout session with:', data);    
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing');
      }
      
      // Call our Supabase Edge Function to create a checkout session
      const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }
      
      const result = await response.json();
      
      return {
        id: 'cs_test_' + Math.random().toString(36).substring(2, 15),
        url: result.url || result.sessionId
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  },

  // Create a customer portal session
  createCustomerPortalSession: async function(customerId: string, returnUrl: string) {
    // In a real application, this would make a request to your backend
    // which would then create a Stripe customer portal session
    
    console.log('Creating portal session with:', { customerId, returnUrl });

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing');
      }
      
      // Call our Supabase Edge Function to create a portal session
      const response = await fetch(`${supabaseUrl}/functions/v1/stripe-portal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId, returnUrl }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create portal session');
      }
      
      const { url } = await response.json();
      window.location.href = url;
      
      return {
        url,
      };
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw new Error('Failed to create portal session');
    }
  },

  // Get payment methods for a customer
  getPaymentMethods: async function(customerId: string) {
    // In a real application, this would make a request to your backend
    // which would then fetch payment methods from Stripe
    
    console.log('Fetching payment methods for:', customerId);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing');
      }
      
      // Call our Supabase Edge Function to get payment methods
      const response = await fetch(`${supabaseUrl}/functions/v1/stripe-payment-methods`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw new Error('Failed to fetch payment methods');
    }
  },

  // Get invoices for a customer
  getInvoices: async function(customerId: string) {
    // In a real application, this would make a request to your backend
    // which would then fetch invoices from Stripe
    
    console.log('Fetching invoices for:', customerId);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing');
      }
      
      // Call our Supabase Edge Function to get invoices
      const response = await fetch(`${supabaseUrl}/functions/v1/stripe-invoices`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw new Error('Failed to fetch invoices');
    }
  },

  // Request a custom quote
  requestCustomQuote: async function(data: {
    companyName: string;
    contactName: string;
    email: string;
    phone?: string;
    teamSize: string;
    requirements: string;
    timeline: string;
  }) {
    // In a real application, this would make a request to your backend
    // which would then process the custom quote request    
    console.log('Requesting custom quote with:', data);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing');
      }
      
      // Call our Supabase Edge Function to submit a custom quote request
      const response = await fetch(`${supabaseUrl}/functions/v1/custom-quote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit quote request');
      }
      
      return {
        success: true,
        message: 'Quote request submitted successfully'
      };
    } catch (error) {
      console.error('Error requesting custom quote:', error);
      throw new Error('Failed to submit quote request');
    }
  },

  // Add payment method
  addPaymentMethod: async function(customerId: string) {
    // In a real application, this would create a setup intent and redirect to Stripe
    console.log('Adding payment method for:', customerId);
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing');
      }
      
      // Call our Supabase Edge Function to create a setup intent
      const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create setup intent');
      }
      
      const { clientSecret } = await response.json();
      
      // Here we would typically open a Stripe Elements UI for payment method entry
      // For now, we'll just throw an error since we don't have the UI components set up
      throw new Error('Payment method management requires Stripe Elements integration');
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  },

  // Create a setup intent for adding a payment method
  createSetupIntent: async function(customerId: string) {
    // In a real application, this would make a request to your backend
    // which would then create a Stripe setup intent
    
    console.log('Creating setup intent for:', customerId);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing');
      }
      
      // Call our Supabase Edge Function to create a setup intent
      const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create setup intent');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating setup intent:', error);
      throw new Error('Failed to create setup intent');
    }
  },

  // Set default payment method
  setDefaultPaymentMethod: async function(customerId: string, paymentMethodId: string) {
    // In a real application, this would make a request to your backend
    // which would then update the customer's default payment method in Stripe
    
    console.log('Setting default payment method:', { customerId, paymentMethodId });

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing');
      }
      
      // Call our Supabase Edge Function to set default payment method
      const response = await fetch(`${supabaseUrl}/functions/v1/set-default-payment-method`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId, paymentMethodId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to set default payment method');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw new Error('Failed to set default payment method');
    }
  },

  // Delete payment method
  deletePaymentMethod: async function(paymentMethodId: string) {
    // In a real application, this would make a request to your backend
    // which would then delete the payment method in Stripe
    
    console.log('Deleting payment method:', paymentMethodId);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing');
      }
      
      // Call our Supabase Edge Function to delete payment method
      const response = await fetch(`${supabaseUrl}/functions/v1/delete-payment-method`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete payment method');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw new Error('Failed to delete payment method');
    }
  },
  
  // Purchase a feature for a demo
  purchaseFeatureForDemo: async function(
    userId: string,
    userEmail: string,
    demoId: string,
    featureType: 'featured_demo'
  ) {
    try {
      // For featured demo, use the checkout session with metadata
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/solutions?success=true&demoId=${demoId}&feature=${featureType}`;
      const cancelUrl = `${baseUrl}/solutions?canceled=true`;
      
      // Get the add-on for featured demo
      const featuredDemoAddOn = addOns.find(a => a.id === 'premium_badge');
      
      if (!featuredDemoAddOn) {
        throw new Error('Featured demo add-on not found');
      }
      
      // Create a checkout session
      const { url } = await this.createCheckoutSession({
        userId,
        userEmail,
        priceId: featuredDemoAddOn.stripePriceId,
        successUrl,
        cancelUrl,
        metadata: {
          feature_type: featureType,
          demo_id: demoId
        }
      });
      
      // Redirect to the checkout URL
      window.location.href = url;
    } catch (error) {
      console.error('Error purchasing feature:', error);
      throw error;
    }
  },
  
  // Enhance payment link with user information
  enhancePaymentLink: function(paymentLink: string, userId: string, userEmail: string): string {
    const enhancedLink = new URL(paymentLink);
    
    // Add user ID as client_reference_id
    enhancedLink.searchParams.append('client_reference_id', userId);
    
    // Add user ID to metadata
    enhancedLink.searchParams.append('metadata[user_id]', userId);
    
    // Prefill email if available
    if (userEmail) {
      enhancedLink.searchParams.append('prefilled_email', userEmail);
    }
    
    return enhancedLink.toString();
  }
};

// Export the Stripe promise for direct use if needed
export { stripePromise };