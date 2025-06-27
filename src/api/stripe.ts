// This is a mock API file for demonstration purposes
// In a real application, these endpoints would be implemented on the server

export async function createCheckoutSession(data: {
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
  
  // Simulate a successful response
  return {
    id: 'cs_test_' + Math.random().toString(36).substring(2, 15),
  };
}

export async function createPortalSession(data: {
  customerId: string;
  returnUrl: string;
}) {
  // In a real application, this would make a request to your backend
  // which would then create a Stripe customer portal session
  
  console.log('Creating portal session with:', data);
  
  // Simulate a successful response
  return {
    url: `${window.location.origin}/billing?portal=true`,
  };
}

export async function getPaymentMethods(customerId: string) {
  // In a real application, this would make a request to your backend
  // which would then fetch payment methods from Stripe
  
  console.log('Fetching payment methods for:', customerId);
  
  // Simulate a successful response with mock data
  return [
    {
      id: 'pm_' + Math.random().toString(36).substring(2, 15),
      type: 'card',
      card: {
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2025
      },
      isDefault: true
    }
  ];
}

export async function getInvoices(customerId: string) {
  // In a real application, this would make a request to your backend
  // which would then fetch invoices from Stripe
  
  console.log('Fetching invoices for:', customerId);
  
  // Simulate a successful response with mock data
  return [
    {
      id: 'in_' + Math.random().toString(36).substring(2, 15),
      date: new Date(),
      description: 'Professional Plan - Monthly',
      amount: 79,
      status: 'paid',
      downloadUrl: '#'
    }
  ];
}

export async function requestCustomQuote(data: {
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
  
  // Simulate a successful response
  return {
    success: true,
    message: 'Quote request submitted successfully'
  };
}