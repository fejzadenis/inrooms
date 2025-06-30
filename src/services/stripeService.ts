import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  eventsQuota: number;
  features: string[];
  stripePriceId: string;
  paymentLink: string; // Added payment link field
  isPopular?: boolean;
  targetAudience: string;
  valueProposition: string;
  isCustom?: boolean;
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  stripePriceId: string;
  icon: string;
  benefits: string[];
}

export const addOns: AddOn[] = [
  {
    id: 'premium_profile_badge',
    name: 'Premium Profile Badge',
    description: 'Stand out with a verified premium badge on your profile',
    price: 29,
    stripePriceId: 'price_premium_badge_monthly',
    icon: 'crown',
    benefits: [
      'Verified premium badge on profile',
      'Higher visibility in search results',
      'Priority in connection recommendations',
      'Enhanced profile analytics',
      'Premium member directory listing'
    ]
  },
  {
    id: 'featured_demo',
    name: 'Featured Demo',
    description: 'Highlight your demo at the top of the Solutions page',
    price: 49,
    stripePriceId: 'price_featured_demo_monthly',
    icon: 'star',
    benefits: [
      'Prominent placement at the top of Solutions page',
      'Highlighted with special visual treatment',
      'Increased visibility to potential customers',
      '30 days of featured status',
      'Performance analytics for your featured demo'
    ]
  }
];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 39,
    interval: 'month',
    eventsQuota: 3,
    targetAudience: 'New sales professionals, individual contributors',
    valueProposition: 'Affordable entry point for career growth',
    features: [
      '3 networking events per month',
      'Basic profile features',
      'Event recordings access (30 days)',
      'Standard networking tools',
      'Email support',
      'Mobile app access'
    ],
    stripePriceId: 'price_starter_monthly',
    paymentLink: 'https://buy.stripe.com/5kQ3cvey37n2bc3bUo9bO00'
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    interval: 'month',
    eventsQuota: 8,
    isPopular: true,
    targetAudience: 'Experienced sales professionals, account managers',
    valueProposition: 'Comprehensive networking for serious professionals',
    features: [
      '8 networking events per month',
      'Enhanced profile with skills verification',
      'Priority event registration',
      'Advanced networking analytics',
      'Direct messaging with all connections',
      'Event recordings access (90 days)',
      'LinkedIn integration',
      'Calendar integration',
      'Priority support'
    ],
    stripePriceId: 'price_professional_monthly',
    paymentLink: 'https://buy.stripe.com/fZu00j4XtgXCdkb6A49bO01'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 149,
    interval: 'month',
    eventsQuota: 15,
    targetAudience: 'Sales leaders, executives, teams',
    valueProposition: 'Maximum networking power for leaders',
    features: [
      '15 networking events per month',
      'Premium profile badge included',
      'Early access to exclusive events',
      'Custom event requests',
      'Advanced analytics dashboard',
      'Unlimited event recordings access',
      'Personal networking concierge',
      'Phone support',
      'Team management tools (up to 5 members)',
      'Custom integrations'
    ],
    stripePriceId: 'price_enterprise_monthly',
    paymentLink: 'https://buy.stripe.com/28E8wP61x8r6dkbe2w9bO02'
  },
  {
    id: 'team',
    name: 'Team',
    price: 99,
    interval: 'month',
    eventsQuota: 10,
    targetAudience: 'Sales teams, organizations (3+ users)',
    valueProposition: 'Scale networking across entire sales teams',
    features: [
      '10 events per month per user',
      'Team dashboard and analytics',
      'Bulk event registration',
      'Team networking insights',
      'Admin controls',
      'Dedicated account manager',
      'Custom branding',
      'Team leaderboards',
      'Everything in Professional plan'
    ],
    stripePriceId: 'price_team_monthly',
    paymentLink: 'https://buy.stripe.com/contact'
  },
  {
    id: 'custom',
    name: 'Custom Solution',
    price: 0, // Price will be quoted
    interval: 'month',
    eventsQuota: 0, // Unlimited or custom
    isCustom: true,
    targetAudience: 'Large enterprises, organizations with 50+ users',
    valueProposition: 'Tailored networking solutions for enterprise needs',
    features: [
      'Unlimited networking events',
      'Custom event creation and hosting',
      'White-label platform options',
      'Advanced enterprise integrations',
      'Dedicated customer success manager',
      'Custom analytics and reporting',
      'Priority phone and email support',
      'Custom onboarding and training',
      'SLA guarantees',
      'Enterprise security features'
    ],
    stripePriceId: 'custom_solution',
    paymentLink: 'https://buy.stripe.com/contact'
  }
];

// Annual plans with 20% discount
export const annualPlans: SubscriptionPlan[] = subscriptionPlans
  .filter(plan => !plan.isCustom)
  .map(plan => ({
    ...plan,
    id: `${plan.id}_annual`,
    price: Math.round(plan.price * 12 * 0.8), // 20% discount
    interval: 'year' as const,
    stripePriceId: `${plan.stripePriceId}_annual`,
    paymentLink: plan.paymentLink // Using same payment link for now
  }));

export const allPlans = [...subscriptionPlans, ...annualPlans];

export const stripeService = {
  // Redirect to Stripe payment link
  redirectToPaymentLink(paymentLink: string): void {
    window.location.href = paymentLink;
  },

  async requestCustomQuote(companyInfo: {
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
        throw new Error('Supabase configuration is missing. Please check your environment variables.');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/custom-quote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyInfo),
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

  async createCustomerPortalSession(customerId: string, returnUrl: string) {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing. Please check your environment variables.');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/stripe-portal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create portal session';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          errorMessage = response.statusText || 'Received an invalid response from the server. Please try again.';
        }
        
        throw new Error(errorMessage);
      }

      let portalData;
      try {
        portalData = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error('Received an invalid response from the server. Please try again.');
      }

      const { url } = portalData;
      
      if (!url) {
        throw new Error('No portal URL received from server');
      }
      
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Unable to connect to billing service. Please check your internet connection and try again.');
        }
        throw error;
      }
      
      throw new Error('An unexpected error occurred. Please try again.');
    }
  },

  async getPaymentMethods(customerId: string) {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
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
      return [];
    }
  },

  async getInvoices(customerId: string) {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
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
      return [];
    }
  },

  getPlanByPriceId(priceId: string): SubscriptionPlan | undefined {
    return allPlans.find(plan => plan.stripePriceId === priceId);
  },

  getPlanById(planId: string): SubscriptionPlan | undefined {
    return allPlans.find(plan => plan.id === planId);
  },

  getMonthlyPlans(): SubscriptionPlan[] {
    return subscriptionPlans;
  },

  getAnnualPlans(): SubscriptionPlan[] {
    return annualPlans;
  },

  getAddOns(): AddOn[] {
    return addOns;
  },

  calculateAnnualSavings(monthlyPrice: number): number {
    const annualPrice = monthlyPrice * 12 * 0.8; // 20% discount
    const monthlyCost = monthlyPrice * 12;
    return monthlyCost - annualPrice;
  },

  async addPaymentMethod(customerId: string) {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
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
      
      if (!clientSecret) {
        throw new Error('No client secret received');
      }
      
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // This would typically open Stripe Elements UI for payment method entry
      // For now, we'll just throw an error since we don't have the UI components set up
      throw new Error('Payment method management requires Stripe Elements integration');
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  },

  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string) {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
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
      throw error;
    }
  },

  async deletePaymentMethod(paymentMethodId: string) {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
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
      throw error;
    }
  }
};