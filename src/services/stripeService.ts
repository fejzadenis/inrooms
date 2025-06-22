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
}

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
    stripePriceId: 'price_starter_monthly' // Replace with actual Stripe price ID
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
    stripePriceId: 'price_professional_monthly' // Replace with actual Stripe price ID
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
      'Premium profile badge',
      'Early access to exclusive events',
      'Custom event requests',
      'Advanced analytics dashboard',
      'Unlimited event recordings access',
      'Personal networking concierge',
      'Phone support',
      'Team management tools (up to 5 members)',
      'Custom integrations'
    ],
    stripePriceId: 'price_enterprise_monthly' // Replace with actual Stripe price ID
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
    stripePriceId: 'price_team_monthly' // Replace with actual Stripe price ID
  }
];

// Annual plans with 20% discount
export const annualPlans: SubscriptionPlan[] = subscriptionPlans.map(plan => ({
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
      // Create checkout session via your backend API
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
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
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
      throw error;
    }
  },

  async createCustomerPortalSession(customerId: string, returnUrl: string) {
    try {
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
    throw new Error('Payment method management coming soon');
  },

  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string) {
    // This would normally call your backend to set default payment method
    throw new Error('Payment method management coming soon');
  },

  async deletePaymentMethod(paymentMethodId: string) {
    // This would normally call your backend to delete payment method
    throw new Error('Payment method management coming soon');
  }
};