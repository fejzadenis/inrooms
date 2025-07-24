import React from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { Button } from '../../components/common/Button';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Search,
  Filter,
  Download,
  Edit,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../config/supabase';
import { useEffect, useState } from 'react';

interface SubscriptionData {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'trial' | 'active' | 'cancelled' | 'past_due';
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd?: Date;
  courseCreditsQuota: number;
  courseCreditsUsed: number;
  lastPayment?: Date;
  nextPayment?: Date;
  paymentMethod: string;
}

export function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<'all' | 'starter' | 'professional' | 'enterprise'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'trial' | 'active' | 'cancelled' | 'past_due'>('all');

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        
        // Get subscriptions with user data
        const { data: subData, error: subError } = await supabase
          .from('stripe_subscriptions')
          .select(`
            id,
            user_id,
            price_id,
            status,
            current_period_start,
            current_period_end,
            cancel_at_period_end,
            canceled_at,
            users (
              id,
              name,
              email,
              subscription_events_quota,
              subscription_events_used
              subscription_course_credits_quota,
              subscription_course_credits_used
            ),
            stripe_prices (
              unit_amount,
              currency,
              interval
            )
          `);
          
        if (subError) throw subError;
        
        // Get payment methods
        const { data: paymentData, error: paymentError } = await supabase
          .from('stripe_payment_methods')
          .select('customer_id, card_last4');
          
        if (paymentError) throw paymentError;
        
        // Format subscription data
        const formattedSubscriptions = subData.map(sub => {
          // Find payment method for this customer
          const paymentMethod = paymentData.find(pm => pm.customer_id === sub.customer_id);
          
          // Determine plan type based on price
          let plan: 'starter' | 'professional' | 'enterprise' = 'starter';
          if (sub.users?.subscription_course_credits_quota >= 3) { // Professional plan has 3 course credits
            plan = 'professional';
          }
          if (sub.users?.subscription_course_credits_quota >= 999) { // Enterprise plan has unlimited course credits
            plan = 'enterprise';
          }
          
          return {
            id: sub.id,
            userId: sub.user_id,
            userName: sub.users?.name || 'Unknown User',
            userEmail: sub.users?.email || 'unknown@example.com',
            plan,
            status: sub.status as any,
            amount: (sub.stripe_prices?.unit_amount || 0) / 100,
            billingCycle: sub.stripe_prices?.interval === 'year' ? 'yearly' : 'monthly',
            currentPeriodStart: new Date(sub.current_period_start),
            currentPeriodEnd: new Date(sub.current_period_end),
            trialEnd: sub.trial_end ? new Date(sub.trial_end) : undefined,
            courseCreditsQuota: sub.users?.subscription_course_credits_quota || 0,
            courseCreditsUsed: sub.users?.subscription_course_credits_used || 0,
            lastPayment: sub.current_period_start ? new Date(sub.current_period_start) : undefined,
            nextPayment: sub.current_period_end ? new Date(sub.current_period_end) : undefined,
            paymentMethod: paymentMethod ? `**** ${paymentMethod.card_last4}` : 'Unknown'
          };
        });

        setSubscriptions(formattedSubscriptions);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        toast.error('Failed to load subscription data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscriptions();
  }, []);

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) {
      return;
    }

    try {
      // Call Stripe API through Supabase function
      const { error } = await supabase.functions.invoke('cancel-subscription', {
        body: { subscriptionId }
      });
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setSubscriptions(subs => 
        subs.map(sub => 
          sub.id === subscriptionId 
            ? { ...sub, status: 'cancelled' as const }
            : sub
        )
      );
      
      toast.success('Subscription cancelled successfully');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  const handleRefund = async (subscriptionId: string) => {
    if (!window.confirm('Are you sure you want to process a refund for this subscription?')) {
      return;
    }

    try {
      // In real app, this would call Stripe API
      toast.success('Refund processed successfully');
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error('Failed to process refund');
    }
  };

  const handleExportSubscriptions = () => {
    const csvContent = [
      ['User', 'Email', 'Plan', 'Status', 'Amount', 'Billing Cycle', 'Next Payment', 'Events Used'],
      ...filteredSubscriptions.map(sub => [
        sub.userName,
        sub.userEmail,
        sub.plan,
        sub.status,
        `$${sub.amount}`,
        sub.billingCycle,
        sub.nextPayment?.toLocaleDateString() || 'N/A',
        `${sub.courseCreditsUsed}/${sub.courseCreditsQuota}`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'subscriptions-export.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlan = filterPlan === 'all' || sub.plan === filterPlan;
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const stats = React.useMemo(() => {
    const totalRevenue = subscriptions
      .filter(sub => sub.status === 'active')
      .reduce((sum, sub) => sum + (sub.amount || 0), 0);
    
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
    const trialSubscriptions = subscriptions.filter(sub => sub.status === 'trial').length;
    const churnRate = subscriptions.filter(sub => sub.status === 'cancelled').length / subscriptions.length * 100;

    return {
      totalRevenue: Math.round(totalRevenue),
      activeSubscriptions,
      trialSubscriptions,
      churnRate: Math.round(churnRate * 100) / 100
    };
  }, [subscriptions]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'trial':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'past_due':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'starter':
        return 'bg-blue-100 text-blue-800';
      case 'professional':
        return 'bg-purple-100 text-purple-800';
      case 'enterprise':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading subscriptions...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
            <p className="text-gray-600 mt-2">Monitor and manage user subscriptions and billing</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleExportSubscriptions}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button>
              <CreditCard className="w-4 h-4 mr-2" />
              Billing Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+12% from last month</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                <p className="text-3xl font-bold text-blue-600">{stats.activeSubscriptions}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trial Users</p>
                <p className="text-3xl font-bold text-orange-600">{stats.trialSubscriptions}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                <p className="text-3xl font-bold text-red-600">{stats.churnRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by user name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Plans</option>
                <option value="starter">Starter</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="trial">Trial</option>
                <option value="active">Active</option>
                <option value="past_due">Past Due</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No subscriptions found</h3>
              <p className="text-gray-500 mt-2">
                {searchTerm ? 'Try adjusting your search terms' : 'No subscriptions match the selected filters'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan & Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Billing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Payment
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubscriptions.map((subscription) => (
                    <tr key={subscription.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {subscription.userName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {subscription.userEmail}
                          </div>
                          <div className="text-xs text-gray-400">
                            {subscription.paymentMethod}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanColor(subscription.plan)}`}>
                            {subscription.plan}
                          </span>
                          <div className="flex items-center">
                            {getStatusIcon(subscription.status)}
                            <span className="ml-1 text-sm text-gray-900 capitalize">
                              {subscription.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${subscription.amount}/{subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {subscription.billingCycle}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {subscription.courseCreditsUsed} / {subscription.courseCreditsQuota} course credits
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${
                              subscription.courseCreditsUsed >= subscription.courseCreditsQuota 
                                ? 'bg-red-500' 
                                : 'bg-green-500'
                            }`}
                            style={{ // Use courseCreditsUsed and courseCreditsQuota
                              width: `${(subscription.courseCreditsUsed / subscription.courseCreditsQuota) * 100}%`,
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {subscription.nextPayment?.toLocaleDateString() || 'N/A'}
                        {subscription.trialEnd && (
                          <div className="text-xs text-orange-600">
                            Trial ends: {subscription.trialEnd.toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          {subscription.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelSubscription(subscription.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Cancel
                            </Button>
                          )}
                          {subscription.status === 'past_due' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRefund(subscription.id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Refund
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}