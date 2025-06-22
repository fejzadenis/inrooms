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
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    interval: 'month',
    eventsQuota: 2,
    features: [
      '2 networking events per month',
      'Access to event recordings',
      'Basic profile features',
      'Email support'
    ],
    stripePriceId: 'price_1234567890' // Replace with actual Stripe price ID
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    interval: 'month',
    eventsQuota: 5,
    features: [
      '5 networking events per month',
      'Access to event recordings',
      'Enhanced profile features',
      'Priority event registration',
      'Advanced networking tools',
      'Email support'
    ],
    stripePriceId: 'price_1234567891' // Replace with actual Stripe price ID
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    interval: 'month',
    eventsQuota: 12,
    features: [
      '12 networking events per month',
      'Access to event recordings',
      'Premium profile features',
      'Priority event registration',
      'Custom event scheduling',
      'Advanced analytics',
      'Dedicated account manager',
      'Phone support'
    ],
    stripePriceId: 'price_1234567892' // Replace with actual Stripe price ID
  }
];

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
    return subscriptionPlans.find(plan => plan.stripePriceId === priceId);
  },

  getPlanById(planId: string): SubscriptionPlan | undefined {
    return subscriptionPlans.find(plan => plan.id === planId);
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
        amount: 99,
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