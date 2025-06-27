import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { PricingCard } from '../../components/billing/PricingCard';
import { PaymentMethodCard } from '../../components/billing/PaymentMethodCard';
import { AddOnCard } from '../../components/billing/AddOnCard';
import { CustomQuoteModal } from '../../components/billing/CustomQuoteModal';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { stripeService, type SubscriptionPlan } from '../../services/stripeService';
import { toast } from 'react-hot-toast';
import { TrendingUp, Crown, CheckCircle, AlertCircle, CreditCard, Download, ExternalLink } from 'lucide-react';

export function BillingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<SubscriptionPlan | null>(null);
  const [paymentMethods, setPaymentMethods] = React.useState<any[]>([]);
  const [invoices, setInvoices] = React.useState<any[]>([]);
  const [loadingData, setLoadingData] = React.useState(true);
  const [billingInterval, setBillingInterval] = React.useState<'monthly' | 'yearly'>('monthly');
  const [isQuoteModalOpen, setIsQuoteModalOpen] = React.useState(false);
  const [activeAddOns, setActiveAddOns] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Simulate loading billing data
    setTimeout(() => {
      // Mock payment methods
      setPaymentMethods([
        {
          id: 'pm_1',
          type: 'card',
          card: {
            brand: 'visa',
            last4: '4242',
            expMonth: 12,
            expYear: 2025
          },
          isDefault: true
        }
      ]);
      
      // Mock invoices
      setInvoices([
        {
          id: 'in_1',
          date: new Date(),
          description: 'Professional Plan - Monthly',
          amount: 79,
          status: 'paid',
          downloadUrl: '#'
        }
      ]);
      
      setLoadingData(false);
    }, 1000);
  }, []);

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (!user) {
      toast.error('Please log in to subscribe');
      return;
    }

    if (currentPlan?.id === plan.id) {
      toast.info('You are already subscribed to this plan');
      return;
    }

    setLoading(true);
    setSelectedPlan(plan);

    try {
      // For demo purposes, show a success message instead of redirecting to Stripe
      toast.success('This is a demo. In a real app, you would be redirected to Stripe Checkout.');
      
      // Simulate a delay before showing success
      setTimeout(() => {
        toast.success('Plan updated successfully!');
      }, 2000);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start checkout process. Please try again.');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const handleRequestQuote = (plan: SubscriptionPlan) => {
    setIsQuoteModalOpen(true);
  };

  const handleManageBilling = async () => {
    toast.info('This is a demo. In a real app, you would be redirected to the Stripe Customer Portal.');
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    toast.success('Default payment method updated');
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) {
      return;
    }
    toast.success('Payment method deleted');
  };

  const handleUpdatePaymentMethod = (paymentMethodId: string) => {
    toast.info('Payment method update coming soon');
  };

  const handleAddPaymentMethod = async () => {
    toast.info('Add payment method feature coming soon');
  };

  const handleDownloadInvoice = (invoiceUrl: string) => {
    toast.info('Invoice download feature coming soon');
  };

  const handleToggleAddOn = (addOn: any) => {
    setActiveAddOns(prev => 
      prev.includes(addOn.id) 
        ? prev.filter(id => id !== addOn.id)
        : [...prev, addOn.id]
    );
    
    if (activeAddOns.includes(addOn.id)) {
      toast.success(`${addOn.name} removed from your plan`);
    } else {
      toast.success(`${addOn.name} added to your plan`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const plans = stripeService.getMonthlyPlans();
  const addOns = stripeService.getAddOns();

  const currentPlan = React.useMemo(() => {
    if (!user?.subscription) return null;
    return stripeService.getMonthlyPlans().find(plan => 
      plan.eventsQuota === user.subscription.eventsQuota
    ) || stripeService.getMonthlyPlans()[0];
  }, [user]);

  if (loadingData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading billing information...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
            <p className="text-gray-600 mt-2">Manage your subscription, payment methods, and billing history</p>
          </div>
          <Button onClick={handleManageBilling} className="flex items-center">
            <ExternalLink className="w-4 h-4 mr-2" />
            Manage Billing
          </Button>
        </div>

        {/* Current Subscription Status */}
        {user && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Subscription</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Plan</h3>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {currentPlan?.name || 'Professional'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {currentPlan?.targetAudience || 'Experienced sales professionals'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <div className="flex items-center mt-1">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    user.subscription?.status === 'active' ? 'bg-green-500' :
                    user.subscription?.status === 'trial' ? 'bg-blue-500' : 'bg-gray-500'
                  }`} />
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {user.subscription?.status || 'Active'}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Events Remaining</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {(user.subscription?.eventsQuota || 8) - (user.subscription?.eventsUsed || 0)} / {user.subscription?.eventsQuota || 8}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((user.subscription?.eventsUsed || 0) / (user.subscription?.eventsQuota || 8)) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Monthly Value</h3>
                <p className="text-lg font-semibold text-green-600">
                  ${currentPlan?.price || 79}
                </p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>ROI: {currentPlan ? Math.round(10000 / currentPlan.price) : 126}x</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Billing Toggle */}
        <div className="flex justify-center">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                billingInterval === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 relative ${
                billingInterval === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Subscription Plans */}
        <div id="plans">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {plans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={currentPlan?.id === plan.id}
                onSelectPlan={handleSelectPlan}
                onRequestQuote={handleRequestQuote}
                loading={loading && selectedPlan?.id === plan.id}
                billingInterval={billingInterval}
              />
            ))}
          </div>
        </div>

        {/* Add-ons Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Premium Add-ons</h2>
              <p className="text-gray-600">Enhance your networking experience with premium features</p>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Crown className="w-4 h-4 mr-1" />
              Available for all plans
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addOns.map((addOn) => (
              <AddOnCard
                key={addOn.id}
                addOn={addOn}
                isActive={activeAddOns.includes(addOn.id)}
                onToggle={handleToggleAddOn}
                loading={false}
              />
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
            <Button onClick={handleAddPaymentMethod} className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
          
          <div className="space-y-4">
            {paymentMethods.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No payment methods</h3>
                <p className="text-gray-500 mt-2">Add a payment method to manage your subscription</p>
                <Button className="mt-4" onClick={handleAddPaymentMethod}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            ) : (
              paymentMethods.map((paymentMethod) => (
                <PaymentMethodCard
                  key={paymentMethod.id}
                  paymentMethod={paymentMethod}
                  onSetDefault={handleSetDefaultPaymentMethod}
                  onDelete={handleDeletePaymentMethod}
                  onUpdate={handleUpdatePaymentMethod}
                />
              ))
            )}
          </div>
        </div>

        {/* Billing History */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing History</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No invoices yet</h3>
                <p className="text-gray-500 mt-2">Your billing history will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(invoice.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {invoice.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${invoice.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(invoice.status)}
                            <span className={`ml-2 text-sm font-medium capitalize ${
                              invoice.status === 'paid' ? 'text-green-800' :
                              invoice.status === 'pending' ? 'text-yellow-800' :
                              'text-red-800'
                            }`}>
                              {invoice.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadInvoice(invoice.downloadUrl)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Billing Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Billing Information</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Your subscription will automatically renew each billing period</li>
                  <li>You can cancel or change your plan at any time</li>
                  <li>Unused events do not roll over to the next billing period</li>
                  <li>Annual plans save 20% compared to monthly billing</li>
                  <li>Add-ons can be added or removed at any time</li>
                  <li>All prices are in USD and exclude applicable taxes</li>
                  <li>Secure payments processed by Stripe</li>
                </ul>
              </div>
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