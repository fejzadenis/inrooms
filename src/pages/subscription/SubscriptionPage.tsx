import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { PricingCard } from '../../components/billing/PricingCard';
import { CustomQuoteModal } from '../../components/billing/CustomQuoteModal';
import { AddOnCard } from '../../components/billing/AddOnCard';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { stripeService, type SubscriptionPlan } from '../../services/stripeService';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';
import { CheckCircle, ArrowRight, Star, Zap, Users, Crown, DollarSign, Plus } from 'lucide-react';

export function SubscriptionPage() {
  const { user, startFreeTrial } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<SubscriptionPlan | null>(null);
  const [billingInterval, setBillingInterval] = React.useState<'monthly' | 'yearly'>('monthly');
  const [isQuoteModalOpen, setIsQuoteModalOpen] = React.useState(false);
  const [selectedAddOns, setSelectedAddOns] = React.useState<string[]>([]);

  // Check for success/cancel parameters from Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success === 'true') {
      toast.success('Subscription activated successfully!');
      navigate('/billing', { replace: true });
    } else if (canceled === 'true') {
      toast.error('Subscription canceled. You can try again anytime.');
      navigate('/subscription', { replace: true });
    }
  }, [searchParams, navigate]);

  const handleFreeTrial = async () => {
    if (!user) {
      toast.error('Please log in to start your free trial');
      navigate('/login', { state: { from: '/subscription' } });
      return;
    }

    try {
      setLoading(true);
      await startFreeTrial();
      toast.success('Free trial activated! Enjoy your 7-day trial with 2 events.');
      navigate('/events');
    } catch (error) {
      console.error('Failed to start free trial:', error);
      toast.error('Failed to start free trial. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (!user) {
      toast.error('Please log in to subscribe');
      navigate('/login', { state: { from: '/subscription' } });
      return;
    }

    setLoading(true);
    setSelectedPlan(plan);

    try {      
      // Get the appropriate price ID based on billing interval
      let priceId = plan.stripePriceId;
      
      // For yearly billing with monthly plans, use the annual price ID
      if (billingInterval === 'yearly' && plan.interval === 'month') {
        // Try to find the annual version of this plan
        const annualPlan = stripeService.getAnnualPlans().find(p => p.id === `${plan.id}_annual`);
        if (annualPlan) {
          priceId = annualPlan.stripePriceId;
        } else {
          // Fallback to appending _annual to the price ID
          priceId = `${plan.stripePriceId}_annual`;
        }
      }
      
      // Create a checkout session using our edge function
      const { url } = await stripeService.createCheckoutSession({
        userId: user.id,
        userEmail: user.email,
        priceId: priceId,
        successUrl: `${window.location.origin}/billing?success=true`,
        cancelUrl: `${window.location.origin}/subscription?canceled=true`,
        metadata: {
          plan_id: plan.id,
          billing_interval: billingInterval
        }
      });
      
      // Redirect to the checkout URL
      console.log(`Redirecting to Stripe Checkout: ${url}`);
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned from Stripe');
      }
    } catch (error) {
      console.error('Error redirecting to payment page:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process payment. Please try again.');
      setLoading(false);
      setSelectedPlan(null);
    }

    try {      
      // Get the appropriate price ID based on billing interval
      let priceId = plan.stripePriceId;
      
      // For yearly billing with monthly plans, use the annual price ID
      if (billingInterval === 'yearly' && plan.interval === 'month') {
        // Try to find the annual version of this plan
        const annualPlan = stripeService.getAnnualPlans().find(p => p.id === `${plan.id}_annual`);
        if (annualPlan) {
          priceId = annualPlan.stripePriceId;
        } else {
          // Fallback to appending _annual to the price ID
          priceId = `${plan.stripePriceId}_annual`;
        }
      }
      
      // Create a checkout session using our edge function
      const { url } = await stripeService.createCheckoutSession({
        userId: user.id,
        userEmail: user.email,
        priceId: priceId,
        successUrl: `${window.location.origin}/billing?success=true`,
        cancelUrl: `${window.location.origin}/subscription?canceled=true`,
        metadata: {
          plan_id: plan.id,
          billing_interval: billingInterval
        }
      });
      
      // Redirect to the checkout URL
      console.log(`Redirecting to Stripe Checkout: ${url}`);
      window.location.href = url;
    } catch (error) {
      console.error('Error redirecting to payment page:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process payment. Please try again.');
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const handleBillingIntervalChange = (interval: 'monthly' | 'yearly') => {
    setBillingInterval(interval);
    // Reset selected plan when changing billing interval
    setSelectedPlan(null);
  };

  const handleToggleAddOn = (addOn: any) => {
    setSelectedAddOns(prev => 
      prev.includes(addOn.id) 
        ? prev.filter(id => id !== addOn.id)
        : [...prev, addOn.id]
    );
  };

  const plans = stripeService.getMonthlyPlans();
  const addOns = stripeService.getAddOns();

  const features = [
    'Access to exclusive networking events',
    'Connect with verified tech sales professionals',
    'Event recordings and resources',
    'Advanced profile features',
    'Priority customer support'
  ];

  const valueProps = [
    {
      icon: DollarSign,
      title: 'ROI-Focused',
      description: 'One good connection can generate $10K+ in deals'
    },
    {
      icon: Users,
      title: 'Quality Network',
      description: 'Connect with verified sales professionals only'
    },
    {
      icon: Zap,
      title: 'Time Efficient',
      description: 'Curated events save hours of cold outreach'
    },
    {
      icon: Star,
      title: 'Career Growth',
      description: 'Learn from industry leaders and top performers'
    }
  ];

  const totalAddOnCost = selectedAddOns.reduce((total, addOnId) => {
    const addOn = addOns.find(a => a.id === addOnId);
    return total + (addOn?.price || 0);
  }, 0);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Choose Your Networking Plan
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Start with a 7-day free trial, then select the perfect plan for your networking needs. 
            Join thousands of tech sales professionals growing their careers with inRooms.
          </p>
          
          {/* Free Trial CTA */}
          <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8 max-w-2xl mx-auto border border-indigo-200">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">Start Your Free Trial</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Get full access to all features for 7 days with 2 event credits. No credit card required.
            </p>
            <Button
              onClick={handleFreeTrial}
              isLoading={loading && !selectedPlan}
              className="text-lg px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              Start 7-Day Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Value Propositions */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Why inRooms Delivers Results
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valueProps.map((prop, index) => {
              const Icon = prop.icon;
              return (
                <div key={index} className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{prop.title}</h3>
                  <p className="text-sm text-gray-600">{prop.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => handleBillingIntervalChange('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                billingInterval === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => handleBillingIntervalChange('yearly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 relative ${
                billingInterval === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="absolute -top-3 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Choose the Right Plan for You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                onSelectPlan={(selectedPlan) => handleSelectPlan(selectedPlan)}
                onRequestQuote={() => setIsQuoteModalOpen(true)}
                loading={loading && selectedPlan?.id === plan.id}
                billingInterval={billingInterval}
              />
            ))}
          </div>
        </div>

        {/* Add-ons Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Enhance Your Experience
            </h2>
            <p className="text-xl text-gray-600">
              Add premium features to any plan for even better networking results
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {addOns.map((addOn) => (
              <AddOnCard
                key={addOn.id}
                addOn={addOn}
                isActive={selectedAddOns.includes(addOn.id)}
                onToggle={handleToggleAddOn}
                loading={false}
              />
            ))}
          </div>

          {selectedAddOns.length > 0 && (
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-2">Selected Add-ons</h3>
              <div className="space-y-2">
                {selectedAddOns.map(addOnId => {
                  const addOn = addOns.find(a => a.id === addOnId);
                  return addOn ? (
                    <div key={addOnId} className="flex justify-between text-sm">
                      <span>{addOn.name}</span>
                      <span>${addOn.price}/month</span>
                    </div>
                  ) : null;
                })}
                <div className="border-t border-yellow-300 pt-2 flex justify-between font-semibold">
                  <span>Total Add-ons:</span>
                  <span>${totalAddOnCost}/month</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Features Overview */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            What's Included in Every Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-indigo-600" />
                </div>
                <p className="text-sm text-gray-700">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ROI Calculator */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 mb-16 border border-green-200">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Calculate Your ROI</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">$79</div>
                <div className="text-sm text-gray-600">Monthly Investment</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">1</div>
                <div className="text-sm text-gray-600">Quality Connection</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">$10K+</div>
                <div className="text-sm text-gray-600">Potential Deal Value</div>
              </div>
            </div>
            <p className="text-gray-600 mt-4">
              Professional plan pays for itself with just one meaningful connection per year
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I change my plan later?</h3>
              <p className="text-gray-600 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades, 
                or at the next billing cycle for downgrades.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What happens to unused events?</h3>
              <p className="text-gray-600 text-sm">
                Unused events don't roll over to the next billing cycle. 
                <a
                  href="mailto:support@inrooms.com" 
                  className="text-indigo-600 hover:text-indigo-500 ml-1"
                >
                  Contact our support team
                </a> for questions about your event credits.
              </p>
            </div>
          </div>
        </div>
      </div>

      <CustomQuoteModal 
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
      />
    </MainLayout>
  );
}