import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../config/supabase';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Types for Stripe integration
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  targetAudience: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  isPopular?: boolean;
  isCustom?: boolean;
  eventsQuota: number;
  valueProposition: string;
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

// Monthly plans
const monthlyPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For individuals getting started',
    targetAudience: 'Solo founders and early-stage startups',
    price: 39,
    interval: 'month',
    features: [
      '3 events per month',
      'Basic founder profile',
      'Access to recordings',
      'Email support',
      'Mobile app access'
    ],
    isPopular: false,
    eventsQuota: 3,
    valueProposition: 'Perfect for founders just starting their journey',
    stripePriceId: 'price_starter_monthly',
    paymentLink: 'https://buy.stripe.com/test_starter'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For active networkers',
    targetAudience: 'Active founders and startup teams',
    price: 79,
    interval: 'month',
    features: [
      '8 events per month',
      'Enhanced founder profile',
      'Priority event registration',
      'Advanced co-founder matching',
      'Email & chat support'
    ],
    isPopular: true,
    eventsQuota: 8,
    valueProposition: 'Our most popular plan for serious founders',
    stripePriceId: 'price_professional_monthly',
    paymentLink: 'https://buy.stripe.com/test_professional'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For power users',
    targetAudience: 'Scaling founders and venture-backed startups',
    price: 149,
    interval: 'month',
    features: [
      '15 events per month',
      'Premium founder profile',
      'Custom event scheduling',
      'Dedicated account manager',
      'Phone support',
      'Startup analytics dashboard'
    ],
    isPopular: false,
    eventsQuota: 15,
    valueProposition: 'Everything you need to scale your startup',
    stripePriceId: 'price_enterprise_monthly',
    paymentLink: 'https://buy.stripe.com/test_enterprise'
  },
  {
    id: 'team',
    name: 'Team',
    description: 'For startup teams',
    targetAudience: 'Startup teams (min. 3 users)',
    price: 99,
    interval: 'month',
    features: [
      '10 events per user/month',
      'Team management tools',
      'Bulk event registration',
      'Team analytics',
      'Dedicated account manager'
    ],
    isPopular: false,
    eventsQuota: 10,
    valueProposition: 'Bring your whole team for better collaboration',
    stripePriceId: 'price_team_monthly',
    paymentLink: 'https://buy.stripe.com/test_team'
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'For enterprises',
    targetAudience: 'Large organizations with custom needs',
    price: 0,
    interval: 'month',
    features: [
      'Unlimited events',
      'Custom integrations',
      'Dedicated support team',
      'Custom branding',
      'Enterprise SSO',
      'Advanced security features'
    ],
    isPopular: false,
    isCustom: true,
    eventsQuota: 999,
    valueProposition: 'Tailored solutions for your organization',
    stripePriceId: 'custom',
    paymentLink: 'https://buy.stripe.com/test_custom'
  }
];

// Annual plans (20% discount)
const annualPlans: SubscriptionPlan[] = [
  {
    id: 'starter_annual',
    name: 'Starter',
    description: 'For individuals getting started',
    targetAudience: 'Solo founders and early-stage startups',
    price: 374, // 39 * 12 * 0.8 = 374.4
    interval: 'year',
    features: [
      '3 events per month',
      'Basic founder profile',
      'Access to recordings',
      'Email support',
      'Mobile app access'
    ],
    isPopular: false,
    eventsQuota: 3,
    valueProposition: 'Perfect for founders just starting their journey',
    stripePriceId: 'price_starter_annual',
    paymentLink: 'https://buy.stripe.com/test_starter_annual'
  },
  {
    id: 'professional_annual',
    name: 'Professional',
    description: 'For active networkers',
    targetAudience: 'Active founders and startup teams',
    price: 758, // 79 * 12 * 0.8 = 758.4
    interval: 'year',
    features: [
      '8 events per month',
      'Enhanced founder profile',
      'Priority event registration',
      'Advanced co-founder matching',
      'Email & chat support'
    ],
    isPopular: true,
    eventsQuota: 8,
    valueProposition: 'Our most popular plan for serious founders',
    stripePriceId: 'price_professional_annual',
    paymentLink: 'https://buy.stripe.com/test_professional_annual'
  },
  {
    id: 'enterprise_annual',
    name: 'Enterprise',
    description: 'For power users',
    targetAudience: 'Scaling founders and venture-backed startups',
    price: 1430, // 149 * 12 * 0.8 = 1430.4
    interval: 'year',
    features: [
      '15 events per month',
      'Premium founder profile',
      'Custom event scheduling',
      'Dedicated account manager',
      'Phone support',
      'Startup analytics dashboard'
    ],
    isPopular: false,
    eventsQuota: 15,
    valueProposition: 'Everything you need to scale your startup',
    stripePriceId: 'price_enterprise_annual',
    paymentLink: 'https://buy.stripe.com/test_enterprise_annual'
  },
  {
    id: 'team_annual',
    name: 'Team',
    description: 'For startup teams',
    targetAudience: 'Startup teams (min. 3 users)',
    price: 950, // 99 * 12 * 0.8 = 950.4
    interval: 'year',
    features: [
      '10 events per user/month',
      'Team management tools',
      'Bulk event registration',
      'Team analytics',
      'Dedicated account manager'
    ],
    isPopular: false,
    eventsQuota: 10,
    valueProposition: 'Bring your whole team for better collaboration',
    stripePriceId: 'price_team_annual',
    paymentLink: 'https://buy.stripe.com/test_team_annual'
  }
];

// Add-ons
const addOns: AddOn[] = [
  {
    id: 'premium_profile',
    name: 'Premium Profile Badge',
    description: 'Stand out with a verified badge and higher visibility',
    price: 29,
    icon: 'crown',
    benefits: [
      'Verified profile badge',
      'Higher search visibility',
      'Priority in connection recommendations',
      'Extended profile customization',
      'Featured in directory listings'
    ],
    paymentLink: 'https://buy.stripe.com/test_premium_profile'
  },
  {
    id: 'extra_events',
    name: 'Extra Event Pack',
    description: 'Add 5 more events to your monthly quota',
    price: 39,
    icon: 'zap',
    benefits: [
      '5 additional events per month',
      'Rollover unused events (up to 3)',
      'Priority registration for popular events',
      'Access to exclusive event recordings',
      'Event reminder notifications'
    ],
    paymentLink: 'https://buy.stripe.com/test_extra_events'
  },
  {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Get detailed insights into your networking activity',
    price: 19,
    icon: 'star',
    benefits: [
      'Detailed networking metrics',
      'Connection quality scoring',
      'Personalized networking recommendations',
      'Activity reports and trends',
      'Export data to CSV/PDF'
    ],
    paymentLink: 'https://buy.stripe.com/test_advanced_analytics'
  }
];

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
      console.log('Creating checkout session with data:', data);
      console.log('User ID:', data.userId);
      console.log('User Email:', data.userEmail);
      console.log('Price ID:', data.priceId);
      console.log('Success URL:', data.successUrl);
      console.log('Cancel URL:', data.cancelUrl);
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Supabase configuration missing');
        throw new Error('Supabase configuration is missing');
      }

      console.log('Supabase URL:', supabaseUrl);
      console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present (not shown)' : 'Missing');
      console.log('Making request to:', `${supabaseUrl}/functions/v1/create-checkout-session`);
      
      // Log the request details
      console.log('Request method:', 'POST');
      console.log('Request headers:', {
        'Authorization': 'Bearer [REDACTED]',
        'Content-Type': 'application/json',
      });
      console.log('Request body:', JSON.stringify(data));
      
      const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
      
      if (!response.ok) {
        console.error('Response not OK');
        try {
          const errorText = await response.text();
          console.error('Error response text:', errorText);
          
          try {
            const errorData = JSON.parse(errorText);
            console.error('Parsed error data:', errorData);
            throw new Error(errorData.error || 'Failed to create checkout session');
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            throw new Error(`Failed to create checkout session: ${errorText}`);
          }
        } catch (textError) {
          console.error('Error getting response text:', textError);
          throw new Error(`Failed to create checkout session: ${response.status} ${response.statusText}`);
        }
      }

      try {
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        try {
          const result = JSON.parse(responseText);
          console.log('Checkout session created:', result);
          return { 
            sessionId: result.sessionId || '',
            url: result.url || '' 
          };
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          throw new Error('Invalid response format');
        }
      } catch (textError) {
        console.error('Error getting response text:', textError);
        throw new Error('Failed to read response');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
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