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
        stripePriceId: 'price_1Rif3UGCopIxkzs6WPBgO8wt'
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
        stripePriceId: 'price_1Rif4MGCopIxkzs6EN1InWXN'
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
        stripePriceId: 'price_1Rif6HGCopIxkzs6rLt5gZQf'
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
  }): Promise<{ sessionId: string; url: string }> {
    try {
      console.log('[Stripe Service] Creating checkout session with data:', {
        userId: data.userId,
        userEmail: data.userEmail,
        priceId: data.priceId,
        successUrl: data.successUrl,
        cancelUrl: data.cancelUrl,
        metadata: data.metadata
      });
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('[Stripe Service] Supabase configuration missing');
        throw new Error('Supabase configuration is missing');
      }

      console.log('[Stripe Service] Making request to:', `${supabaseUrl}/functions/v1/create-checkout-session`);
      
      // Convert userId to string to ensure consistency
      const requestData = {
        ...data,
        userId: data.userId.toString()
      };
      
      const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('[Stripe Service] Response status:', response.status);
      
      if (!response.ok) {
        console.error('[Stripe Service] Response not OK');
        try {
          const errorText = await response.text();
          console.error('[Stripe Service] Error response text:', errorText);
          
          try {
            const errorData = JSON.parse(errorText);
            console.error('[Stripe Service] Parsed error data:', errorData);
            throw new Error(errorData.error || 'Failed to create checkout session');
          } catch (parseError) {
            console.error('[Stripe Service] Error parsing error response:', parseError);
            throw new Error(`Failed to create checkout session: ${errorText}`);
          }
        } catch (textError) {
          console.error('[Stripe Service] Error getting response text:', textError);
          throw new Error(`Failed to create checkout session: ${response.status} ${response.statusText}`);
        }
      }

      try {
        const responseText = await response.text();
        console.log('[Stripe Service] Response text:', responseText);
        
        try {
          const result = JSON.parse(responseText);
          console.log('[Stripe Service] Checkout session created:', result);
          return { 
            sessionId: result.sessionId || '',
            url: result.url || '' 
          };
        } catch (parseError) {
          console.error('[Stripe Service] Error parsing JSON response:', parseError);
          throw new Error('Invalid response format');
        }
      } catch (textError) {
        console.error('[Stripe Service] Error getting response text:', textError);
        throw new Error('Failed to read response');
      }
    } catch (error) {
      console.error('[Stripe Service] Error creating checkout session:', error);
      console.error('[Stripe Service] Error details:', error instanceof Error ? error.message : String(error));
      console.error('[Stripe Service] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
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

  // Start a free trial
  async startFreeTrial(userId: string, updateSupabase: boolean = false): Promise<void> {
    try {
      console.log('[Stripe Service] Starting free trial for user:', userId);
      
      const userRef = doc(db, 'users', userId);
      
      // Set trial end date (7 days from now)
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);

      console.log(`[Stripe Service] Setting trial data for user ${userId} in Firestore`);
      
      // Update subscription in Firestore
      await updateDoc(userRef, {
        'subscription.status': 'trial',
        'subscription.eventsQuota': 2,
        'subscription.eventsUsed': 0,
        'subscription.trialEndsAt': trialEndsAt,
        'updatedAt': serverTimestamp()
      });
      
      console.log('[Stripe Service] Updated Firestore with trial subscription data');

      // Also update Supabase if requested
      if (updateSupabase) {
        try {
          console.log(`[Stripe Service] Setting trial data for user ${userId} in Supabase`);
          const userIdString = userId.toString();
          
          const { error } = await supabase
            .from('users')
            .update({
              subscription_status: 'trial',
              subscription_events_quota: 2,
              subscription_events_used: 0,
              subscription_trial_ends_at: trialEndsAt.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', userIdString);
            
          if (error) {
            console.error('[Stripe Service] Error updating Supabase with trial data:', error);
          } else {
            console.log('[Stripe Service] Updated Supabase with trial subscription data');
          }
        } catch (supabaseError) {
          console.error('[Stripe Service] Exception updating Supabase with trial data:', supabaseError);
      console.log('[Stripe Service] Updated Firestore with trial subscription data');
      }
      // Also update Supabase if requested
      if (updateSupabase) {
        try {
          console.log(`[Stripe Service] Setting trial data for user ${userId} in Supabase`);
          const userIdString = userId.toString();
          
          const { error } = await supabase
            .from('users')
            .update({
              subscription_status: 'trial',
              subscription_events_quota: 2,
              subscription_events_used: 0,
              subscription_trial_ends_at: trialEndsAt.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', userIdString);
            
          if (error) {
            console.error('[Stripe Service] Error updating Supabase with trial data:', error);
          } else {
            console.log('[Stripe Service] Updated Supabase with trial subscription data');
          }
        } catch (supabaseError) {
          console.error('[Stripe Service] Exception updating Supabase with trial data:', supabaseError);
        }
      }

      return;
    } catch (error) {
      console.error('Error starting free trial:', error);
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
      const result = await this.createCheckoutSession({
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
      if (result?.url) {
        window.location.href = result.url;
      } else {
        throw new Error('No checkout URL returned');
      }
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