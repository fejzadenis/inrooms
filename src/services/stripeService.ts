import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Types for Stripe integration
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
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

// Mock subscription plans data
const monthlyPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for new networkers',
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
    description: 'For active networkers',
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
    description: 'For power networkers',
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
    description: 'For growing teams',
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
    description: 'Tailored for large organizations',
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

// Mock annual plans (with 20% discount)
const annualPlans: SubscriptionPlan[] = monthlyPlans.map(plan => ({
  ...plan,
  id: `${plan.id}_annual`,
  interval: 'year' as const,
  price: Math.round(plan.price * 12 * 0.8), // 20% discount
  stripePriceId: `${plan.stripePriceId}_annual`,
  paymentLink: plan.paymentLink.replace('monthly', 'annual')
}));

// Mock add-ons data
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

// Mock customer and subscription data
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
  getMonthlyPlans(): SubscriptionPlan[] {
    return monthlyPlans;
  },

  // Get annual plans
  getAnnualPlans(): SubscriptionPlan[] {
    return annualPlans;
  },

  // Get add-ons
  getAddOns(): AddOn[] {
    return addOns;
  },

  // Calculate annual savings
  calculateAnnualSavings(monthlyPrice: number): number {
    const annualPrice = monthlyPrice * 12;
    const discountedAnnualPrice = annualPrice * 0.8; // 20% discount
    return Math.round(annualPrice - discountedAnnualPrice);
  },

  // Redirect to payment link
  redirectToPaymentLink(paymentLink: string): void {
    if (paymentLink) {
      window.location.href = paymentLink;
    } else {
      throw new Error('Payment link not available');
    }
  },

  // Create a checkout session
  async createCheckoutSession(data: {
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate a successful response with a checkout URL
      const checkoutUrl = `https://checkout.stripe.com/pay/cs_test_${Math.random().toString(36).substring(2, 15)}`;
      
      return {
        id: 'cs_test_' + Math.random().toString(36).substring(2, 15),
        url: checkoutUrl
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  },

  // Create a customer portal session
  async createCustomerPortalSession(customerId: string, returnUrl: string) {
    // In a real application, this would make a request to your backend
    // which would then create a Stripe customer portal session
    
    console.log('Creating portal session with:', { customerId, returnUrl });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate a successful response and redirect
      const portalUrl = `https://billing.stripe.com/p/session/test_${Math.random().toString(36).substring(2, 15)}`;
      window.location.href = portalUrl;
      
      return {
        url: portalUrl,
      };
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw new Error('Failed to create portal session');
    }
  },

  // Get payment methods for a customer
  async getPaymentMethods(customerId: string) {
    // In a real application, this would make a request to your backend
    // which would then fetch payment methods from Stripe
    
    console.log('Fetching payment methods for:', customerId);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return mock data or empty array
      const customer = mockCustomers[customerId as keyof typeof mockCustomers];
      return customer?.paymentMethods || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw new Error('Failed to fetch payment methods');
    }
  },

  // Get invoices for a customer
  async getInvoices(customerId: string) {
    // In a real application, this would make a request to your backend
    // which would then fetch invoices from Stripe
    
    console.log('Fetching invoices for:', customerId);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return mock data or empty array
      const customer = mockCustomers[customerId as keyof typeof mockCustomers];
      return customer?.invoices || [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw new Error('Failed to fetch invoices');
    }
  },

  // Request a custom quote
  async requestCustomQuote(data: {
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate a successful response
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
  async addPaymentMethod(customerId: string) {
    // In a real application, this would create a setup intent and redirect to Stripe
    console.log('Adding payment method for:', customerId);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just show a message
      throw new Error('Payment method management coming soon');
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  },

  // Create a setup intent for adding a payment method
  async createSetupIntent(customerId: string) {
    // In a real application, this would make a request to your backend
    // which would then create a Stripe setup intent
    
    console.log('Creating setup intent for:', customerId);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate a successful response
      return {
        clientSecret: 'seti_' + Math.random().toString(36).substring(2, 15) + '_secret_' + Math.random().toString(36).substring(2, 15),
      };
    } catch (error) {
      console.error('Error creating setup intent:', error);
      throw new Error('Failed to create setup intent');
    }
  },

  // Set default payment method
  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string) {
    // In a real application, this would make a request to your backend
    // which would then update the customer's default payment method in Stripe
    
    console.log('Setting default payment method:', { customerId, paymentMethodId });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate a successful response
      return {
        success: true,
        message: 'Default payment method updated successfully'
      };
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw new Error('Failed to set default payment method');
    }
  },

  // Delete payment method
  async deletePaymentMethod(paymentMethodId: string) {
    // In a real application, this would make a request to your backend
    // which would then delete the payment method in Stripe
    
    console.log('Deleting payment method:', paymentMethodId);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate a successful response
      return {
        success: true,
        message: 'Payment method deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw new Error('Failed to delete payment method');
    }
  }
};

// Export the Stripe promise for direct use if needed
export { stripePromise };