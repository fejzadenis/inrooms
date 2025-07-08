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
  popular?: boolean;
  stripePriceId: string;
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  stripePriceId: string;
}

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
      
      // Simulate a successful response
      return {
        id: 'cs_test_' + Math.random().toString(36).substring(2, 15),
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  },

  // Create a customer portal session
  async createPortalSession(data: {
    customerId: string;
    returnUrl: string;
  }) {
    // In a real application, this would make a request to your backend
    // which would then create a Stripe customer portal session
    
    console.log('Creating portal session with:', data);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate a successful response
      return {
        url: `${window.location.origin}/billing?portal=true`,
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