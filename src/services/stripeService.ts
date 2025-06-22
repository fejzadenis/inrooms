import { loadStripe } from '@stripe/stripe-js';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

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
    stripePriceId: 'price_starter_monthly'
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
    stripePriceId: 'price_professional_monthly'
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
    stripePriceId: 'price_enterprise_monthly'
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
    stripePriceId: 'price_team_monthly'
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
  async createCheckoutSession(userId: string, priceId: string, successUrl: string, cancelUrl: string) {
    try {
      // For demo purposes, simulate the checkout process since backend API doesn't exist yet
      console.warn('Stripe backend API not implemented yet. Simulating checkout process...');
      
      // In a real implementation, this would call your backend API
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          priceId,
          successUrl,
          cancelUrl,
        }),
      }).catch(() => {
        // If the API endpoint doesn't exist, throw a helpful error
        throw new Error('Stripe integration is not yet configured. Please contact support to set up billing.');
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create checkout session';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // If response is not JSON, use the status text or a generic message
          errorMessage = response.statusText || 'Received an invalid response from the server. Please try again.';
        }
        
        throw new Error(errorMessage);
      }

      let sessionData;
      try {
        sessionData = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error('Received an invalid response from the server. Please try again.');
      }

      const { sessionId } = sessionData;
      
      if (!sessionId) {
        throw new Error('No session ID received from server');
      }
      
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw error;
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
      // In a real implementation, this would send the quote request to your backend
      const response = await fetch('/api/custom-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyInfo),
      }).catch(() => {
        // For demo purposes, simulate successful submission
        console.log('Custom quote request:', companyInfo);
        return { ok: true, json: () => Promise.resolve({ success: true }) };
      });

      if (!response.ok) {
        throw new Error('Failed to submit quote request');
      }

      return await response.json();
    } catch (error) {
      console.error('Error requesting custom quote:', error);
      throw error;
    }
  },

  async createCustomerPortalSession(customerId: string, returnUrl: string) {
    try {
      // For demo purposes, show a helpful message since backend API doesn't exist yet
      console.warn('Stripe backend API not implemented yet. Customer portal not available.');
      throw new Error('Billing portal is not yet configured. Please contact support for billing management.');
      
      const response = await fetch('/api/stripe/create-portal-session', {
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

  async updateSubscriptionInFirestore(userId: string, subscriptionData: any) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'subscription.status': subscriptionData.status,
        'subscription.stripeCustomerId': subscriptionData.customerId,
        'subscription.stripeSubscriptionId': subscriptionData.subscriptionId,
        'subscription.currentPeriodStart': new Date(subscriptionData.currentPeriodStart * 1000),
        'subscription.currentPeriodEnd': new Date(subscriptionData.currentPeriodEnd * 1000),
        'subscription.eventsQuota': subscriptionData.eventsQuota,
        'subscription.planId': subscriptionData.planId,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating subscription in Firestore:', error);
      throw error;
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

  // Mock function for demo - replace with actual Stripe API calls
  async getPaymentMethods(customerId: string) {
    // This would normally call your backend to get payment methods from Stripe
    return [
      {
        id: 'pm_1234567890',
        type: 'card' as const,
        card: {
          brand: 'visa',
          last4: '4242',
          expMonth: 12,
          expYear: 2025,
        },
        isDefault: true,
      }
    ];
  },

  async getInvoices(customerId: string) {
    // This would normally call your backend to get invoices from Stripe
    return [
      {
        id: 'in_1234567890',
        date: new Date().toISOString(),
        amount: 79,
        status: 'paid',
        description: 'Professional Plan - Current Month',
        downloadUrl: '#'
      }
    ];
  },

  async addPaymentMethod(customerId: string) {
    // This would normally integrate with Stripe Elements to add a payment method
    throw new Error('Payment method management is not yet configured. Please contact support.');
  },

  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string) {
    // This would normally call your backend to set default payment method
    throw new Error('Payment method management is not yet configured. Please contact support.');
  },

  async deletePaymentMethod(paymentMethodId: string) {
    // This would normally call your backend to delete payment method
    throw new Error('Payment method management is not yet configured. Please contact support.');
  }
};