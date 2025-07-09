import React from 'react';
import { toast } from 'react-hot-toast';
import { MainLayout } from '../../layouts/MainLayout';
import { EventCard } from '../../components/common/EventCard';
import { useAuth } from '../../contexts/AuthContext';
import { eventService, type Event } from '../../services/eventService';
import { supabase } from '../../config/supabase';
import { generateCalendarEvent } from '../../utils/calendar';

export function DashboardPage() {
  const { user } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = React.useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    // Get latest subscription data from Supabase
    try {
      setLoading(true);
      
      // Get latest subscription data from Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('subscription_status, subscription_events_quota, subscription_events_used')
        .eq('id', user.id)
        .maybeSingle();
        
      if (!userError && userData) {
        // Create a temporary updated user object with the latest subscription data
        const updatedUser = {
          ...user,
          subscription: {
            ...user.subscription,
            status: userData.subscription_status || user.subscription.status,
            eventsQuota: userData.subscription_events_quota || user.subscription.eventsQuota,
            eventsUsed: userData.subscription_events_used || user.subscription.eventsUsed
          }
        };
        
        // Use the updated user object for the rest of the function
        user.subscription = updatedUser.subscription;
      }
      
      // Load user's registered events
      const registrations = await eventService.getUserRegistrations(user.id);
      const registeredEventIds = registrations.map(reg => reg.eventId);
      setRegisteredEvents(registeredEventIds);

      // Load all upcoming events
      const allEvents = await eventService.getEvents();
      const upcoming = allEvents.filter(event => event.date > new Date());
      setUpcomingEvents(upcoming);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    if (!user) return;

    // Get latest subscription data from Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('subscription_status, subscription_events_quota, subscription_events_used, subscription_trial_ends_at')
      .eq('id', user.id)
      .maybeSingle();
      
    const eventsUsed = userData?.subscription_events_used || user.subscription.eventsUsed;
    const eventsQuota = userData?.subscription_events_quota || user.subscription.eventsQuota;
    
    if (eventsUsed >= eventsQuota) {
      toast.error('You have reached your event quota. Please upgrade your subscription.');
      return;
    }

    const event = upcomingEvents.find(e => e.id === eventId);
    if (!event) return;

    try {
      await eventService.registerForEvent(user.id, eventId);
      
      // Generate calendar event
      try {
        const icsFile = await generateCalendarEvent({
          title: event.title,
          description: event.description,
          startTime: event.date,
          duration: { hours: Math.floor(event.duration / 60), minutes: event.duration % 60 },
          location: event.meetLink || 'Online Event',
        });

        // Create calendar download link
        const blob = new Blob([icsFile], { type: 'text/calendar' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${event.title.toLowerCase().replace(/\s+/g, '-')}.ics`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (calendarError) {
        console.warn('Failed to generate calendar event:', calendarError);
      }

      setRegisteredEvents(prev => [...prev, eventId]);
      await loadDashboardData(); // Reload to update counts
      toast.success('Successfully registered! Calendar invite downloaded.');
    } catch (error) {
      console.error('Failed to register for event:', error);
      toast.error('Failed to register for event. Please try again.');
    }
  };

  const handleJoinMeeting = (meetLink: string) => {
    if (meetLink) {
      window.open(meetLink, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('Meeting link not available');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900">Your Subscription</h2>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Events Remaining</span>
              <span className="text-lg font-medium text-gray-900">
                {(user?.subscription.eventsQuota || 0) - (user?.subscription.eventsUsed || 0)} / {user?.subscription.eventsQuota || 0}
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full"
                style={{
                  width: `${((user?.subscription.eventsUsed || 0) / (user?.subscription.eventsQuota || 1)) * 100}%`,
                }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Subscription Status: <span className="capitalize font-medium">{user?.subscription.status}</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Upcoming Events</h2>
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900">No upcoming events</h3>
              <p className="text-gray-500 mt-2">Check back later for new networking opportunities</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.slice(0, 6).map((event) => (
                <EventCard
                  key={event.id}
                  title={event.title}
                  description={event.description}
                  date={event.date}
                  maxParticipants={event.maxParticipants}
                  currentParticipants={event.currentParticipants}
                  meetLink={event.meetLink}
                  isRegistered={registeredEvents.includes(event.id!)}
                  onRegister={() => handleRegister(event.id!)}
                  onJoin={() => handleJoinMeeting(event.meetLink!)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}