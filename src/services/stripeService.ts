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
  targetAudience: string;
  valueProposition: string;
  eventsQuota: number;
  stripePriceId: string;
  paymentLink?: string;
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  benefits: string[];
  icon: string;
  paymentLink: string;
}

export const stripeService = {
  // Get monthly plans
  getMonthlyPlans(): SubscriptionPlan[] {
    return [
      {
        id: 'starter',
        name: 'Starter',
        description: 'For individuals just getting started',
        price: 39,
        interval: 'month',
        features: [
          '3 events per month',
          'Basic profile features',
          'Access to recordings',
          'Email support',
          'Mobile app access'
        ],
        isPopular: false,
        targetAudience: 'For individuals just getting started',
        valueProposition: 'Perfect for exploring the platform and making initial connections',
        eventsQuota: 3,
        stripePriceId: 'price_starter_monthly'
      },
      {
        id: 'professional',
        name: 'Professional',
        description: 'For active networkers',
        price: 79,
        interval: 'month',
        features: [
          '8 events per month',
          'Enhanced profile features',
          'Priority event registration',
          'Advanced networking tools',
          'Priority email support'
        ],
        isPopular: true,
        targetAudience: 'For active networkers and sales professionals',
        valueProposition: 'Our most popular plan for serious networking',
        eventsQuota: 8,
        stripePriceId: 'price_1RiQ3YGCopIxkzs6b9c7Vryw'
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For power users and teams',
        price: 149,
        interval: 'month',
        features: [
          '15 events per month',
          'Premium profile features',
          'Custom event creation',
          'Dedicated account manager',
          'Phone support'
        ],
        isPopular: false,
        targetAudience: 'For power users and team leaders',
        valueProposition: 'Maximum networking potential with premium features',
        eventsQuota: 15,
        stripePriceId: 'price_enterprise_monthly'
      },
      {
        id: 'team',
        name: 'Team',
        description: 'For sales teams',
        price: 99,
        interval: 'month',
        features: [
          '10 events per user per month',
          'Team management tools',
          'Bulk event registration',
          'Team analytics dashboard',
          'Dedicated account manager'
        ],
        isPopular: false,
        targetAudience: 'For sales teams (min. 3 users)',
        valueProposition: 'Coordinate networking efforts across your entire team',
        eventsQuota: 10,
        stripePriceId: 'price_team_monthly'
      },
      {
        id: 'custom',
        name: 'Enterprise+',
        description: 'Custom solution for large teams',
        price: 0,
        interval: 'month',
        features: [
          'Unlimited events',
          'Custom integrations',
          'Dedicated success manager',
          'Custom training sessions',
          'SLA guarantees'
        ],
        isPopular: false,
        isCustom: true,
        targetAudience: 'For large organizations',
        valueProposition: 'Tailored solution for your specific needs',
        eventsQuota: 999,
        stripePriceId: 'custom'
      }
    ];
  },

  // Get annual plans
  getAnnualPlans(): SubscriptionPlan[] {
    return [
      {
        id: 'starter_annual',
        name: 'Starter',
        description: 'For individuals just getting started',
        price: 374,
        interval: 'year',
        features: [
          '3 events per month',
          'Basic profile features',
          'Access to recordings',
          'Email support',
          'Mobile app access'
        ],
        isPopular: false,
        targetAudience: 'For individuals just getting started',
        valueProposition: 'Perfect for exploring the platform and making initial connections',
        eventsQuota: 3,
        stripePriceId: 'price_starter_annual'
      },
      {
        id: 'professional_annual',
        name: 'Professional',
        description: 'For active networkers',
        price: 758,
        interval: 'year',
        features: [
          '8 events per month',
          'Enhanced profile features',
          'Priority event registration',
          'Advanced networking tools',
          'Priority email support'
        ],
        isPopular: true,
        targetAudience: 'For active networkers and sales professionals',
        valueProposition: 'Our most popular plan for serious networking',
        eventsQuota: 8,
        stripePriceId: 'price_professional_annual'
      },
      {
        id: 'enterprise_annual',
        name: 'Enterprise',
        description: 'For power users and teams',
        price: 1430,
        interval: 'year',
        features: [
          '15 events per month',
          'Premium profile features',
          'Custom event creation',
          'Dedicated account manager',
          'Phone support'
        ],
        isPopular: false,
        targetAudience: 'For power users and team leaders',
        valueProposition: 'Maximum networking potential with premium features',
        eventsQuota: 15,
        stripePriceId: 'price_enterprise_annual'
      },
      {
        id: 'team_annual',
        name: 'Team',
        description: 'For sales teams',
        price: 950,
        interval: 'year',
        features: [
          '10 events per user per month',
          'Team management tools',
          'Bulk event registration',
          'Team analytics dashboard',
          'Dedicated account manager'
        ],
        isPopular: false,
        targetAudience: 'For sales teams (min. 3 users)',
        valueProposition: 'Coordinate networking efforts across your entire team',
        eventsQuota: 10,
        stripePriceId: 'price_team_annual'
      },
      {
        id: 'custom_annual',
        name: 'Enterprise+',
        description: 'Custom solution for large teams',
        price: 0,
        interval: 'year',
        features: [
          'Unlimited events',
          'Custom integrations',
          'Dedicated success manager',
          'Custom training sessions',
          'SLA guarantees'
        ],
        isPopular: false,
        isCustom: true,
        targetAudience: 'For large organizations',
        valueProposition: 'Tailored solution for your specific needs',
        eventsQuota: 999,
        stripePriceId: 'custom'
      }
    ];
  },

  // Get add-ons
  getAddOns(): AddOn[] {
    return [
      {
        id: 'premium_profile',
        name: 'Premium Profile',
        description: 'Stand out with enhanced profile features',
        price: 29,
        benefits: [
          'Verified badge',
          'Higher search visibility',
          'Priority in connection recommendations',
          'Advanced analytics',
          'Custom profile URL'
        ],
        icon: 'crown',
        paymentLink: 'https://buy.stripe.com/test_premium_profile'
      },
      {
        id: 'event_booster',
        name: 'Event Booster',
        description: 'Get more from your events',
        price: 19,
        benefits: [
          'Early access to popular events',
          'Extended recording access',
          'Exclusive VIP events',
          'Post-event networking groups',
          'Event reminders and summaries'
        ],
        icon: 'star',
        paymentLink: 'https://buy.stripe.com/test_event_booster'
      },
      {
        id: 'connection_pro',
        name: 'Connection Pro',
        description: 'Supercharge your networking',
        price: 24,
        benefits: [
          'Unlimited connection requests',
          'Advanced search filters',
          'Connection insights',
          'Introduction requests',
          'Export connections'
        ],
        icon: 'zap',
        paymentLink: 'https://buy.stripe.com/test_connection_pro'
      }
    ];
  },

  // Calculate annual savings
  calculateAnnualSavings(monthlyPrice: number): number {
    const annualPrice = monthlyPrice * 12;
    const annualPriceWithDiscount = annualPrice * 0.8; // 20% discount
    return Math.round(annualPrice - annualPriceWithDiscount);
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
  }): Promise<{ url: string }> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing');
      }

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
      return { url: result.url || window.location.origin };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  // Create a customer portal session
  async createCustomerPortalSession(customerId: string, returnUrl: string): Promise<void> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing');
      }

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
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  },

  // Get payment methods
  async getPaymentMethods(customerId: string) {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/stripe-payment-methods`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get payment methods');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting payment methods:', error);
      return [];
    }
  },

  // Get invoices
  async getInvoices(customerId: string) {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/stripe-invoices`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get invoices');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting invoices:', error);
      return [];
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
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing');
      }

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

      return await response.json();
    } catch (error) {
      console.error('Error requesting custom quote:', error);
      throw error;
    }
  },

  // Add a payment method
  async addPaymentMethod(customerId: string) {
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      // Redirect to Stripe Customer Portal for payment method management
      await this.createCustomerPortalSession(customerId, `${window.location.origin}/billing`);
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  },

  // Set default payment method
  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string) {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/set-default-payment-method`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId, paymentMethodId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to set default payment method');
      }

      return await response.json();
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  },

  // Delete payment method
  async deletePaymentMethod(paymentMethodId: string) {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/delete-payment-method`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete payment method');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  },

  // Purchase feature for demo
  async purchaseFeatureForDemo(
    userId: string,
    userEmail: string,
    demoId: string,
    featureType: 'featured_demo'
  ) {
    try {
      const successUrl = `${window.location.origin}/solutions?success=true&demoId=${demoId}&feature=${featureType}`;
      const cancelUrl = `${window.location.origin}/solutions?canceled=true`;
      
      // Create a checkout session
      const { url } = await this.createCheckoutSession({
        userId,
        userEmail,
        priceId: 'price_featured_demo', // This would be your actual price ID for featuring a demo
        successUrl,
        cancelUrl,
        metadata: {
          demoId,
          feature_type: featureType
        }
      });
      
      // Redirect to checkout
      window.location.href = url;
    } catch (error) {
      console.error('Error purchasing feature:', error);
      throw error;
    }
  },

  // Redirect to payment link
  redirectToPaymentLink(url: string) {
    window.location.href = url;
  }
};

// Export the Stripe promise for direct use if needed
export { stripePromise };