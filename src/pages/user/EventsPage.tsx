import React, { useEffect } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { EventCard } from '../../components/common/EventCard';
import { Search, Filter } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { eventService, type Event } from '../../services/eventService';
import { useAuth } from '../../contexts/AuthContext';
import { useTour } from '../../contexts/TourContext';
import { toast } from 'react-hot-toast';
import { supabase } from '../../config/supabase';
import { generateCalendarEvent } from '../../utils/calendar';

export function EventsPage() {
  const { user } = useAuth();
  const { askForTourPermission, startTour } = useTour();
  const [events, setEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [registeredEvents, setRegisteredEvents] = React.useState<string[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [subscriptionData, setSubscriptionData] = React.useState<{
    status: string;
    eventsQuota: number;
    eventsUsed: number;
  } | null>(null);

  React.useEffect(() => {
    loadEvents();
    if (user) {
      loadUserRegistrations();
    }
  }, [user]);

  // Check if we should show the events tour
  useEffect(() => {
    const checkTourStatus = async () => {
      if (user && !loading) {
        const shouldStart = await askForTourPermission('events');
        if (shouldStart) {
          // Small delay to ensure the UI is fully rendered
          setTimeout(() => {
            startTour('events');
          }, 1000);
        }
      }
    };

    checkTourStatus();
  }, [user, loading, askForTourPermission, startTour]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      // If user is logged in, fetch latest subscription data
      if (user) {
        console.log("EVENTS DEBUG: Fetching subscription data from Supabase for user", user.id);
        const userIdString = user.id.toString();
        
        // Try using the RPC function first
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_user_subscription', { user_id: userIdString });
        
        if (!rpcError && rpcData && rpcData.length > 0) {
          console.log("EVENTS DEBUG: RPC returned subscription data:", rpcData[0]);
          const subscriptionData = rpcData[0];
          
          setSubscriptionData({
            status: subscriptionData.subscription_status || 'inactive',
            eventsQuota: subscriptionData.subscription_events_quota || 0,
            eventsUsed: subscriptionData.subscription_events_used || 0
          });
        } else {
          // Fallback to direct query if RPC fails
          console.log("EVENTS DEBUG: RPC failed, falling back to direct query. Error:", rpcError);
          
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('subscription_status, subscription_events_quota, subscription_events_used')
            .eq('id', userIdString)
            .maybeSingle();
          
          if (!userError && userData) {
            console.log("EVENTS DEBUG: Supabase subscription data:", userData);
            setSubscriptionData({
              status: userData.subscription_status || 'inactive',
              eventsQuota: userData.subscription_events_quota || 0,
              eventsUsed: userData.subscription_events_used || 0
            });
          } else {
            console.log("EVENTS DEBUG: Error or no data from Supabase:", userError);
          }
        }
      }
      
      const eventsData = await eventService.getEvents();
      // Filter to show only upcoming events
      const upcomingEvents = eventsData.filter(event => {
        // Ensure event.date is a valid Date object
        const eventDate = event.date instanceof Date ? 
          event.date : new Date(event.date);
        return eventDate > new Date();
      });
      setEvents(upcomingEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const loadUserRegistrations = async () => {
    if (!user) return;
  };

  const handleRegister = async (eventId: string) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) {
        toast.error('Event not found');
        return;
    // Check if user can register
    const canRegister = await eventService.canRegisterForEvent(user.id, eventId);
    if (!canRegister.success) {
      toast.error(canRegister.message || 'You cannot register for this event');
      
      // If eligible, proceed with registration
      const result = await eventService.registerForEvent(user.id, eventId);
      
      if (!result.success) {
        toast.error(result.message || 'Failed to register for event');
        return;
      const result = await eventService.registerForEvent(user.id, eventId);
      
      if (!result.success) {
        toast.error(result.message || 'Failed to register for event');
        return;
      }
      
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
      
      // Reload to update counts and subscription data
      await loadEvents();
      
      toast.success('Successfully registered! Calendar invite downloaded.');
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to register for event:', errorMessage);
      toast.error(`Failed to register for event: ${errorMessage}`);
    }
  };

  const handleJoinMeeting = (meetLink: string) => {
    if (meetLink) {
      window.open(meetLink, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('Meeting link not available');
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading events...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center" data-tour="events-header">
          <h1 className="text-2xl font-semibold text-gray-900">Upcoming Events</h1>
          <Button>
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="relative" data-tour="events-search">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {user && (
          <div className="bg-indigo-50 rounded-lg p-4" data-tour="events-quota">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-indigo-900">Your Event Quota</h3>
                <p className="text-sm text-indigo-700">
                  {subscriptionData 
                    ? `${Math.max(0, subscriptionData.eventsQuota - subscriptionData.eventsUsed)} events remaining this month`
                    : user?.subscription
                      ? `${Math.max(0, user.subscription.eventsQuota - user.subscription.eventsUsed)} events remaining this month`
                      : '0 events remaining this month'
                  }
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-indigo-900">
                  {subscriptionData 
                    ? `${subscriptionData.eventsUsed} / ${subscriptionData.eventsQuota}`
                    : user?.subscription
                      ? `${user.subscription.eventsUsed || 0} / ${user.subscription.eventsQuota || 0}`
                      : '0 / 0'
                  }
                </div>
                <div className="text-sm text-indigo-600">Events Used</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">No events found</h3>
              <p className="text-gray-500 mt-2">
                {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new events'}
              </p>
            </div>
          ) : (
            filteredEvents.map((event, index) => (
              <div key={event.id} data-tour={index === 0 ? "event-card" : undefined}>
                <EventCard
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
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}