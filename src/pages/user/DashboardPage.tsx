import React, { useState, useEffect } from 'react';
import { Calendar, Users, MessageSquare, TrendingUp, Bell, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTour } from '../../contexts/TourContext';
import { MainLayout } from '../../layouts/MainLayout';
import { EmailVerificationBanner } from '../../components/auth/EmailVerificationBanner';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { eventService, type Event } from '../../services/eventService';
import { connectionService } from '../../services/connectionService';
import { messageService } from '../../services/messageService';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { startTour } = useTour();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<any[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        
        // Load upcoming events
        const events = await eventService.getEvents();
        const upcoming = events
          .filter(event => new Date(event.date) > new Date())
          .slice(0, 3);
        setUpcomingEvents(upcoming);

        // Load connection requests
        const requests = await connectionService.getIncomingConnectionRequests(user.uid);
        setConnectionRequests(requests.slice(0, 3));

        // Load unread message count
        const unreadCount = await messageService.getUnreadMessageCount(user.uid);
        setUnreadMessages(unreadCount);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Email Verification Banner */}
        <EmailVerificationBanner />

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.displayName || user?.email}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening in your network today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingEvents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Connection Requests</p>
                <p className="text-2xl font-bold text-gray-900">{connectionRequests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-gray-900">{unreadMessages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Profile Views</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
                <Link to="/events">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-6">
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {event.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(event.date), 'MMM d, yyyy • h:mm a')}
                        </p>
                        <p className="text-xs text-gray-400">
                          {event.currentParticipants}/{event.maxParticipants} participants
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming events</p>
                  <Link to="/events">
                    <Button className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Browse Events
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Connection Requests */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Connection Requests</h2>
                <Link to="/network">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-6">
              {connectionRequests.length > 0 ? (
                <div className="space-y-4">
                  {connectionRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            New connection request
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(request.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          Accept
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No pending requests</p>
                  <Link to="/network">
                    <Button className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Find Connections
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/events">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Browse Events
              </Button>
            </Link>
            <Link to="/network">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Find Connections
              </Button>
            </Link>
            <Link to="/messages">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-2" />
                Messages
              </Button>
            </Link>
            <button
              onClick={startTour}
              className="flex items-center justify-start w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Bell className="w-4 h-4 mr-2" />
              Take Tour
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};