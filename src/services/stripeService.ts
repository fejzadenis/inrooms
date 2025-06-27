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
    stripePriceId: 'price_1RdZFEGCopIxkzs6S2tcV157'
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
    stripePriceId: 'price_1RdZFQGCopIxkzs6wvAEnJAr'
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
    stripePriceId: 'price_1RdZFcGCopIxkzs68Zkn8Ocl'
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
    stripePriceId: 'price_1RdZFnGCopIxkzs6Yd9Ixvxl'
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
    stripePriceId: 'custom_solution'
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
    stripePriceId: `${plan.stripePriceId}_annual`
  }));

export const allPlans = [...subscriptionPlans, ...annualPlans];

export const stripeService = {
  async createCheckoutSession(userId: string, userEmail: string, priceId: string, successUrl: string, cancelUrl: string, addOns: string[] = []) {
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Create a checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userEmail,
          priceId,
          successUrl,
          cancelUrl,
          addOns,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const session = await response.json();

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      
      // Provide more user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Unable to connect to billing service. Please check your internet connection and try again.');
        }
        throw error;
      }
      
      throw new Error('An unexpected error occurred. Please try again.');
    }
  },

  async purchaseFeatureForDemo(userId: string, userEmail: string, demoId: string, featureType: 'featured_demo'): Promise<void> {
    try {
      // Find the appropriate add-on price ID
      const addOn = addOns.find(a => a.id === featureType);
      if (!addOn) {
        throw new Error(`Unknown feature type: ${featureType}`);
      }

      const successUrl = `${window.location.origin}/solutions?success=true&demoId=${demoId}&feature=${featureType}`;
      const cancelUrl = `${window.location.origin}/solutions?canceled=true`;

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Create a checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userEmail,
          priceId: addOn.stripePriceId,
          successUrl,
          cancelUrl,
          metadata: {
            demoId,
            featureType
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const session = await response.json();

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Error purchasing feature for demo:', error);
      throw error;
    }
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
      const response = await fetch('/api/request-custom-quote', {
        method: 'POST',
        headers: {
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
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create portal session');
      }

      const session = await response.json();

      // Redirect to the customer portal
      window.location.href = session.url;
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
      const response = await fetch('/api/get-payment-methods', {
        method: 'POST',
        headers: {
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
      const response = await fetch('/api/get-invoices', {
        method: 'POST',
        headers: {
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
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Create a setup intent
      const response = await fetch('/api/create-setup-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create setup intent');
      }

      const { clientSecret } = await response.json();

      // Redirect to the setup form
      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: {
            token: 'tok_visa', // This is for testing only
          },
          billing_details: {
            name: 'Jenny Rosen',
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.setupIntent;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  },

  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string) {
    try {
      const response = await fetch('/api/set-default-payment-method', {
        method: 'POST',
        headers: {
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

  async deletePaymentMethod(paymentMethodId: string) {
    try {
      const response = await fetch('/api/delete-payment-method', {
        method: 'POST',
        headers: {
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
  }
};