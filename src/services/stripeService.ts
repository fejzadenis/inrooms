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
  paymentLink: string; // Added payment link field
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
    paymentLink: 'https://buy.stripe.com/4gM00jdtZ4aQa7Z0bG9bO04',
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
    paymentLink: 'https://buy.stripe.com/3cI28rey37n26VN4rW9bO03',
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
    targetAudience: 'Aspiring founders, early-stage startup sellers, and entrepreneurial professionals',
    valueProposition: 'Your gateway to the startup tech sales ecosystem',
    features: [
      'Access to 3 curated startup-focused networking events per month',
      'Basic profile to showcase your startup journey or goals',
      'Event recordings available for 30 days',
      'Essential networking tools for connecting with founders and sales talent',
      'Responsive email support',
      'Full mobile app access for networking on the go'
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
    targetAudience: 'Startup founders, sales leaders, and ambitious tech entrepreneurs',
    valueProposition: 'Advanced tools and visibility for serious startup operators',
    features: [
      'Access to 8 high-impact startup networking events per month',
      'Enhanced profile with founder/sales credibility badges',
      'Priority access to limited-seat events and founder circles',
      'Advanced networking insights to track connections and growth',
      'Unlimited direct messaging with your entire network',
      'Access to event recordings for 90 days',
      'Seamless LinkedIn integration for growth and hiring',
      'Calendar sync to manage meetings and event invites',
      'Priority support for fast-growing professionals'
    ],
    stripePriceId: 'price_professional_monthly',
    paymentLink: 'https://buy.stripe.com/test_5kQ3cvey37n2bc3bUo9bO00'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 149,
    interval: 'month',
    eventsQuota: 15,
    targetAudience: 'Founding teams, sales executives, and fast-scaling startup leaders',
    valueProposition: 'Maximum visibility, reach, and tools for scaling startups',
    features: [
      'Attend 15 curated, high-impact startup events per month',
      'Premium founder/executive profile badge',
      'Early access to investor and partner-focused events',
      'Ability to request custom events or founder roundtables',
      'Advanced analytics on team performance and engagement',
      'Unlimited access to all event recordings',
      'Personal networking concierge for strategic intros',
      'Dedicated phone support with account manager',
      'Team management tools (up to 5 team members included)',
      'Custom CRM or Slack/Notion integrations'
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
    targetAudience: 'Startup sales teams and growing entrepreneurial organizations (3+ users)',
    valueProposition: 'Empower your startup sales team with scalable networking and growth tools',
    features: [
      '10 startup-focused events per user each month',
      'Team dashboard with growth and engagement analytics',
      'Bulk registration for streamlined event access',
      'Insights to optimize team networking and collaboration',
      'Admin controls for managing team access and roles',
      'Dedicated account manager for startup sales success',
      'Custom branding to reflect your startup identity',
      'Competitive team leaderboards to boost motivation',
      'Includes all features from the Professional plan'
    ],
    stripePriceId: 'price_team_monthly',
    paymentLink: 'https://buy.stripe.com/bJeaEXdtZazedkb9Mg9bO05'
  },
  {
    id: 'custom',
    name: 'Custom Solution',
    price: 0, // Price will be quoted
    interval: 'month',
    eventsQuota: 0, // Unlimited or custom
    isCustom: true,
    targetAudience: 'High-growth startups, venture-backed organizations, and large entrepreneurial teams (50+ users)',
    valueProposition: 'Bespoke networking and growth solutions tailored for scaling startups and innovation-driven enterprises',
    features: [
      'Unlimited access to exclusive startup networking events',
      'Custom event creation and co-hosting with startup ecosystem partners',
      'White-label platform and branding tailored to your startup or venture portfolio',
      'Advanced integrations with CRM, investor platforms, and startup tools',
      'Dedicated customer success manager focused on startup growth',
      'Custom analytics and growth reporting designed for startup metrics',
      'Priority phone and email support with fast response times',
      'Personalized onboarding, training, and startup enablement workshops',
      'SLA guarantees aligned with enterprise-grade performance',
      'Enterprise-level security and compliance for sensitive startup data'
    ],
    stripePriceId: 'custom_solution',
    paymentLink: 'https://buy.stripe.com/contact'
  }
];

// Annual plans with 20% discount
export const annualPlans: SubscriptionPlan[] = subscriptionPlans
  .filter(plan => !plan.isCustom)
  .map(plan => {
    // Calculate yearly price with 20% discount
    const yearlyPrice = Math.round(plan.price * 12 * 0.8); // 20% discount
    
    return {
      ...plan,
      id: `${plan.id}_annual`,
      price: yearlyPrice,
      interval: 'year' as const,
      stripePriceId: `${plan.stripePriceId}_annual`,
      paymentLink: plan.paymentLink, // Using same payment link for now
      features: [...plan.features, 'Save 20% with annual billing']
    };
  });

export const allPlans = [...subscriptionPlans, ...annualPlans];
export const stripeService = {
  // Redirect to Stripe payment link
  redirectToPaymentLink(paymentLink: string): void {
    window.location.href = paymentLink;
  },

  enhancePaymentLink(paymentLink: string, userId: string, userEmail: string): string {
    const enhancedLink = new URL(paymentLink);
    
    // Add user ID as client_reference_id
    enhancedLink.searchParams.append('client_reference_id', userId);
    
    // Add user ID and email to metadata
    enhancedLink.searchParams.append('prefilled_email', userEmail);
    
    // Add additional metadata to help identify the user
    enhancedLink.searchParams.append('metadata[user_id]', userId);
    enhancedLink.searchParams.append('metadata[user_email]', userEmail);
    
    console.log(`Enhanced payment link with user ID ${userId} and email ${userEmail}`);
    
    return enhancedLink.toString();
  },

  async purchaseFeatureForDemo(
    userId: string,
    userEmail: string,
    demoId: string,
    featureType: 'featured_demo' 
  ) {
    try {
      // For featured demo, use the hardcoded payment link with query parameters
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/solutions?success=true&demoId=${demoId}&feature=${featureType}`;
      const cancelUrl = `${baseUrl}/solutions?canceled=true`;
      
      // Get the payment link for featured demo
      const paymentLink = addOns.find(a => a.id === featureType)?.paymentLink || '';
      
      if (!paymentLink) {
        throw new Error('Payment link not found');
      }
      
      // Start with basic enhancement for user identification
      let enhancedLink = this.enhancePaymentLink(paymentLink, userId, userEmail);
      
      // Add additional parameters specific to this purchase
      const finalUrl = new URL(enhancedLink);
      finalUrl.searchParams.append('success_url', successUrl);
      finalUrl.searchParams.append('cancel_url', cancelUrl);
      finalUrl.searchParams.append('metadata[demo_id]', demoId);
      finalUrl.searchParams.append('metadata[feature_type]', featureType);
      
      // Redirect to the enhanced payment link
      console.log(`Redirecting to enhanced payment link for feature purchase: ${finalUrl.toString()}`);
      window.location.href = finalUrl.toString();
    } catch (error) {
      console.error('Error purchasing feature:', error);
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

  // Get plan by ID with interval consideration
  getPlanByIdAndInterval(planId: string, interval: 'monthly' | 'yearly'): SubscriptionPlan | undefined {
    if (interval === 'yearly') {
      // First try to find an annual plan with this ID
      const annualPlan = annualPlans.find(plan => plan.id === planId);
      if (annualPlan) return annualPlan;
      
      // If not found, look for the monthly plan and get its annual equivalent
      const monthlyPlan = subscriptionPlans.find(plan => plan.id === planId);
      if (monthlyPlan) {
        return annualPlans.find(plan => plan.id === `${planId}_annual`);
      }
    } else {
      // For monthly, just find the plan directly
      return subscriptionPlans.find(plan => plan.id === planId);
    }
    
    // If nothing found, return undefined
    return undefined;
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
    // Calculate how much is saved by paying annually vs monthly
    const annualCost = monthlyPrice * 12 * 0.8; // 20% discount
    const monthlyCost = monthlyPrice * 12;
    return Math.round(monthlyCost - annualCost);
  },

  // Calculate annual price with 20% discount
  calculateAnnualPrice(monthlyPrice: number): number {
    return Math.round(monthlyPrice * 12 * 0.8); // 20% discount
  },
  
  // Get the appropriate price ID based on billing interval
  getPriceIdForBillingInterval(plan: SubscriptionPlan, billingInterval: 'monthly' | 'yearly'): string {
    if (billingInterval === 'yearly') {
      // For yearly billing, use the annual price ID if available
      const annualPlan = annualPlans.find(p => p.id === `${plan.id}_annual`);
      if (annualPlan) {
        return annualPlan.stripePriceId;
      }
    }
    
    // Default to the plan's price ID
    return plan.stripePriceId;
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