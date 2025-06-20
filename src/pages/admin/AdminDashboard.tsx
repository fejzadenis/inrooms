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
  Bell,
  MessageSquare,
  CreditCard
} from 'lucide-react';

function AdminDashboardHome() {
  const stats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalEvents: 156,
    upcomingEvents: 23,
    monthlyRevenue: 12500,
    yearlyRevenue: 150000,
    growthRate: 15.3
  };

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
            value={stats.totalUsers.toLocaleString()}
            change={8.2}
            description="Registered users"
          />
          <StatsCard
            title="Active Users"
            value={stats.activeUsers.toLocaleString()}
            change={5.1}
            description="Active in last 30 days"
          />
          <StatsCard
            title="Total Events"
            value={stats.totalEvents}
            change={12.3}
            description="All events created"
          />
          <StatsCard
            title="Monthly Revenue"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
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
              <div className="text-sm text-gray-500">Upcoming events</div>
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
              <div className="text-sm text-gray-500">Active users</div>
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
              <div className="text-2xl font-bold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-500">This month</div>
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
              <div className="text-sm text-gray-500">Monthly growth</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">New event "Enterprise Sales Workshop" created</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">15 new user registrations today</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">$2,450 in subscription revenue today</p>
                <p className="text-xs text-gray-500">6 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-orange-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Email campaign "Weekly Newsletter" sent to 1,247 users</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export function AdminDashboard() {
  return (
    <Routes>
      <Route index element={<AdminDashboardHome />} />
      <Route path="events" element={<AdminEventsPage />} />
      <Route path="users" element={<AdminUsersPage />} />
      <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
      <Route path="communications" element={<AdminCommunicationsPage />} />
      <Route path="notifications" element={<AdminNotificationsPage />} />
      <Route path="settings" element={<AdminSettingsPage />} />
    </Routes>
  );
}