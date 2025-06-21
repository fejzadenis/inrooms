import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { PricingCard } from '../../components/billing/PricingCard';
import { PaymentMethodCard } from '../../components/billing/PaymentMethodCard';
import { CreditCard, Download, Plus, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { stripeService, subscriptionPlans, type SubscriptionPlan } from '../../services/stripeService';
import { toast } from 'react-hot-toast';

export function BillingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<SubscriptionPlan | null>(null);

  // Mock payment methods - in real app, fetch from Stripe
  const [paymentMethods] = React.useState([
    {
      id: 'pm_1',
      type: 'card' as const,
      card: {
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2024,
      },
      isDefault: true,
    },
    {
      id: 'pm_2',
      type: 'card' as const,
      card: {
        brand: 'mastercard',
        last4: '5555',
        expMonth: 8,
        expYear: 2025,
      },
      isDefault: false,
    }
  ]);

  // Mock invoices - in real app, fetch from Stripe
  const [invoices] = React.useState([
    { 
      id: 'inv_1', 
      date: '2024-03-01', 
      amount: 99, 
      status: 'paid',
      description: 'Professional Plan - March 2024',
      downloadUrl: '#'
    },
    { 
      id: 'inv_2', 
      date: '2024-02-01', 
      amount: 99, 
      status: 'paid',
      description: 'Professional Plan - February 2024',
      downloadUrl: '#'
    },
    { 
      id: 'inv_3', 
      date: '2024-01-01', 
      amount: 49, 
      status: 'paid',
      description: 'Starter Plan - January 2024',
      downloadUrl: '#'
    }
  ]);

  const currentPlan = React.useMemo(() => {
    if (!user?.subscription) return null;
    return subscriptionPlans.find(plan => 
      plan.eventsQuota === user.subscription.eventsQuota
    ) || subscriptionPlans[0];
  }, [user]);

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
      const successUrl = `${window.location.origin}/billing?success=true`;
      const cancelUrl = `${window.location.origin}/billing?canceled=true`;

      await stripeService.createCheckoutSession(
        user.id,
        plan.stripePriceId,
        successUrl,
        cancelUrl
      );
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start checkout process. Please try again.');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const handleManageBilling = async () => {
    if (!user?.subscription?.stripeCustomerId) {
      toast.error('No billing information found');
      return;
    }

    try {
      const returnUrl = `${window.location.origin}/billing`;
      await stripeService.createCustomerPortalSession(
        user.subscription.stripeCustomerId,
        returnUrl
      );
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast.error('Failed to open billing portal. Please try again.');
    }
  };

  const handleSetDefaultPaymentMethod = (paymentMethodId: string) => {
    toast.success('Default payment method updated');
    // In real app, call Stripe API to update default payment method
  };

  const handleDeletePaymentMethod = (paymentMethodId: string) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      toast.success('Payment method deleted');
      // In real app, call Stripe API to delete payment method
    }
  };

  const handleUpdatePaymentMethod = (paymentMethodId: string) => {
    toast.info('Payment method update coming soon');
    // In real app, open Stripe Elements to update payment method
  };

  const handleAddPaymentMethod = () => {
    toast.info('Add payment method coming soon');
    // In real app, open Stripe Elements to add new payment method
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.success('Invoice download started');
    // In real app, download invoice from Stripe
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Plan</h3>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {currentPlan?.name || 'Free Trial'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <div className="flex items-center mt-1">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    user.subscription.status === 'active' ? 'bg-green-500' :
                    user.subscription.status === 'trial' ? 'bg-blue-500' : 'bg-gray-500'
                  }`} />
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {user.subscription.status}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Events Remaining</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {user.subscription.eventsQuota - user.subscription.eventsUsed} / {user.subscription.eventsQuota}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(user.subscription.eventsUsed / user.subscription.eventsQuota) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Plans */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {subscriptionPlans.map((plan, index) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={currentPlan?.id === plan.id}
                isPopular={index === 1} // Professional plan is popular
                onSelectPlan={handleSelectPlan}
                loading={loading && selectedPlan?.id === plan.id}
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
            {paymentMethods.map((paymentMethod) => (
              <PaymentMethodCard
                key={paymentMethod.id}
                paymentMethod={paymentMethod}
                onSetDefault={handleSetDefaultPaymentMethod}
                onDelete={handleDeletePaymentMethod}
                onUpdate={handleUpdatePaymentMethod}
              />
            ))}
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
                            onClick={() => handleDownloadInvoice(invoice.id)}
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
                  <li>Your subscription will automatically renew each month</li>
                  <li>You can cancel or change your plan at any time</li>
                  <li>Unused events do not roll over to the next billing period</li>
                  <li>All prices are in USD and exclude applicable taxes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}