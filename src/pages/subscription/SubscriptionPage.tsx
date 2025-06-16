import React from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';
import { MainLayout } from '../../layouts/MainLayout';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    eventsPerMonth: 2,
    features: [
      '2 networking events per month',
      'Access to event recordings',
      'Basic profile features',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    eventsPerMonth: 5,
    features: [
      '5 networking events per month',
      'Access to event recordings',
      'Enhanced profile features',
      'Priority event registration',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    eventsPerMonth: 12,
    features: [
      '12 networking events per month',
      'Access to event recordings',
      'Premium profile features',
      'Priority event registration',
      'Custom event scheduling',
    ],
  },
];

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        console.error('[error]', error);
        toast.error('Payment failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button
        type="submit"
        className="w-full mt-4"
        isLoading={isLoading}
        disabled={!stripe}
      >
        Subscribe Now
      </Button>
    </form>
  );
}

export function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null);
  const [showPayment, setShowPayment] = React.useState(false);
  const { startFreeTrial } = useAuth();
  const navigate = useNavigate();

  const handleFreeTrial = async () => {
    try {
      await startFreeTrial();
      toast.success('Free trial activated! Enjoy your 7-day trial.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to start free trial:', error);
      toast.error('Failed to start free trial. Please try again.');
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setShowPayment(true);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose your plan
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Start with a 7-day free trial, then select the perfect plan for your networking needs
          </p>
          <div className="mt-6">
            <Button
              onClick={handleFreeTrial}
              variant="outline"
              className="text-lg px-8 py-3"
            >
              Start 7-Day Free Trial
            </Button>
          </div>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg shadow-sm divide-y divide-gray-200 ${
                selectedPlan === plan.id
                  ? 'ring-2 ring-indigo-600'
                  : ''
              }`}
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {plan.name}
                </h3>
                <p className="mt-4 text-sm text-gray-500">
                  Perfect for {plan.eventsPerMonth} events per month
                </p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-base font-medium text-gray-500">
                    /mo
                  </span>
                </p>
                <Button
                  className="mt-8 w-full"
                  variant={selectedPlan === plan.id ? 'primary' : 'outline'}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                </Button>
              </div>
              <div className="px-6 pt-6 pb-8">
                <h4 className="text-sm font-medium text-gray-900 tracking-wide">
                  What's included
                </h4>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <svg
                        className="flex-shrink-0 h-5 w-5 text-green-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {showPayment && (
          <div className="mt-12 max-w-lg mx-auto">
            <div className="bg-white p-8 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Payment Details</h3>
              <Elements stripe={stripePromise}>
                <CheckoutForm />
              </Elements>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}