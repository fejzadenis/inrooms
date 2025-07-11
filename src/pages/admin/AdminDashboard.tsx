import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminLayout } from '../../layouts/AdminLayout';
import { AdminEventsPage } from './AdminEventsPage';
import { AdminUsersPage } from './AdminUsersPage';
import { AdminSubscriptionsPage } from './AdminSubscriptionsPage';
import { AdminCommunicationsPage } from './AdminCommunicationsPage';
import { AdminNotificationsPage } from './AdminNotificationsPage';
import { AdminSettingsPage } from './AdminSettingsPage';
import { StatsCard } from '../../components/admin/StatsCard';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Activity,
  MessageSquare,
  CreditCard
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { toast } from 'react-hot-toast';

function AdminDashboardHome() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    monthlyRevenue: 0,
    growthRate: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch user stats
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, subscription_status, created_at')
          .order('created_at', { ascending: false });
          
        if (usersError) throw usersError;
        
        // Fetch events
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true });
          
        if (eventsError) throw eventsError;
        
        // Fetch subscriptions for revenue calculation
        const { data: subscriptions, error: subsError } = await supabase
          .from('stripe_subscriptions')
          .select('*')
          .eq('status', 'active');
          
        if (subsError) throw subsError;
        
        // Calculate stats
        const now = new Date();
        const activeUsers = users.filter(u => u.subscription_status === 'active' || u.subscription_status === 'trial').length;
        const upcomingEvents = events.filter(e => new Date(e.date) > now).length;
        
        // Calculate monthly revenue (simplified)
        const monthlyRevenue = subscriptions.reduce((sum, sub) => {
          return sum + (sub.unit_amount || 0) / 100;
        }, 0);
        
        // Calculate growth rate (simplified - comparing to previous month)
        const lastMonthDate = new Date();
        lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
        const thisMonthUsers = users.filter(u => new Date(u.created_at) > lastMonthDate).length;
        const prevMonthDate = new Date(lastMonthDate);
        prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
        const lastMonthUsers = users.filter(u => {
          const createdAt = new Date(u.created_at);
          return createdAt > prevMonthDate && createdAt <= lastMonthDate;
        }).length;
        
        const growthRate = lastMonthUsers > 0 
          ? Math.round(((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100) 
          : 0;
        
        setStats({
          totalUsers: users.length,
          activeUsers,
          totalEvents: events.length,
          upcomingEvents,
          monthlyRevenue,
          growthRate
        });
        
        // Get recent activity
        const recentRegistrations = await supabase
          .from('registrations')
          .select('*, users(name)')
          .order('registered_at', { ascending: false })
          .limit(5);
          
        const recentSubscriptions = await supabase
          .from('stripe_subscriptions')
          .select('*, users(name)')
          .order('created_at', { ascending: false })
          .limit(5);
          
        // Combine and sort activities
        const activities = [
          ...(recentRegistrations.data || []).map(reg => ({
            type: 'registration',
            title: 'New Event Registration',
            message: `${reg.users?.name || 'A user'} registered for an event`,
            time: new Date(reg.registered_at),
            icon: Calendar
          })),
          ...(recentSubscriptions.data || []).map(sub => ({
            type: 'subscription',
            title: 'New Subscription',
            message: `${sub.users?.name || 'A user'} subscribed to ${sub.status} plan`,
            time: new Date(sub.created_at),
            icon: CreditCard
          }))
        ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 4);
        
        setRecentActivity(activities);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of platform performance and key metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Users" 
            value={loading ? '...' : stats.totalUsers.toLocaleString()}
            change={stats.growthRate}
            description="All registered users"
          />
          <StatsCard
            title="Active Users"
            value={loading ? '...' : stats.activeUsers.toLocaleString()}
            change={stats.activeUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}
            description="Active in last 30 days"
          />
          <StatsCard
            title="Total Events"
            value={loading ? '...' : stats.totalEvents}
            change={stats.upcomingEvents > 0 ? Math.round((stats.upcomingEvents / stats.totalEvents) * 100) : 0}
            description="All events created"
          />
          <StatsCard
            title="Monthly Revenue"
            value={loading ? '...' : `$${stats.monthlyRevenue.toLocaleString()}`}
            change={stats.growthRate}
            description="Current month revenue"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Events</h3>
                <p className="text-sm text-gray-500">Manage networking events</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</div>
              <div className="text-sm text-gray-500">{loading ? 'Loading...' : 'Upcoming events'}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Users</h3>
                <p className="text-sm text-gray-500">User management</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">{stats.activeUsers}</div>
              <div className="text-sm text-gray-500">{loading ? 'Loading...' : 'Active users'}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Revenue</h3>
                <p className="text-sm text-gray-500">Subscription revenue</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">${loading ? '...' : stats.monthlyRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-500">{loading ? 'Loading...' : 'This month'}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Growth</h3>
                <p className="text-sm text-gray-500">Platform growth</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">{stats.growthRate}%</div>
              <div className="text-sm text-gray-500">{loading ? 'Loading...' : 'Monthly growth'}</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Loading activity data...</div>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No recent activity found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const ActivityIcon = activity.icon;
                const timeAgo = getTimeAgo(activity.time);
                
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 ${
                        activity.type === 'registration' ? 'bg-blue-100' : 
                        activity.type === 'subscription' ? 'bg-purple-100' : 'bg-green-100'
                      } rounded-full flex items-center justify-center`}>
                        <ActivityIcon className={`w-4 h-4 ${
                          activity.type === 'registration' ? 'text-blue-600' : 
                          activity.type === 'subscription' ? 'text-purple-600' : 'text-green-600'
                        }`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{timeAgo}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

// Helper function to format time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (diffSec < 60) return `${diffSec} seconds ago`;
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHour < 24) return `${diffHour} hours ago`;
  if (diffDay < 30) return `${diffDay} days ago`;
  
  return date.toLocaleDateString();
}

export function AdminDashboard() {
  return (
    <Routes>
      <Route index element={<AdminDashboardHome />} />
      <Route path="events" element={<AdminEventsPage />} />
      <Route path="users" element={<AdminUsersPage />} />
      <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
      <Route path="notifications" element={<AdminNotificationsPage />} />
      <Route path="settings" element={<AdminSettingsPage />} />
    </Routes>
  );
}