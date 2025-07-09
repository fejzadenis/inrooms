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
  const [subscriptionData, setSubscriptionData] = React.useState<{
    status: string;
    eventsQuota: number;
    eventsUsed: number;
    trialEndsAt?: Date;
  } | null>(null);

  React.useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    console.log("DASHBOARD DEBUG: Loading dashboard data for user", user.id, "type:", typeof user.id);
    
    console.log("DASHBOARD DEBUG: Loading dashboard data for user", user.id, "type:", typeof user.id);
    
    // Get latest subscription data from Supabase
    try {
      setLoading(true);
      
      const userIdString = user.id.toString();
      console.log("DASHBOARD DEBUG: Using user ID string:", userIdString);
      
      const userIdString = user.id.toString();
      console.log("DASHBOARD DEBUG: Using user ID string:", userIdString);
      
      // Fetch latest subscription data from Supabase
      console.log("DASHBOARD DEBUG: Fetching subscription data from Supabase for user", user.id);
      
      // Try using the RPC function first
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_user_subscription', { user_id: userIdString });
      
      if (!rpcError && rpcData && rpcData.length > 0) {
        console.log("DASHBOARD DEBUG: RPC returned subscription data:", rpcData[0]);
        const subscriptionData = rpcData[0];
        
        setSubscriptionData({
          status: subscriptionData.subscription_status || 'inactive',
          eventsQuota: subscriptionData.subscription_events_quota || 0,
          eventsUsed: subscriptionData.subscription_events_used || 0,
          trialEndsAt: subscriptionData.subscription_trial_ends_at ? new Date(subscriptionData.subscription_trial_ends_at) : undefined
        });
      } else {
        // Fallback to direct query if RPC fails
        console.log("DASHBOARD DEBUG: RPC failed, falling back to direct query. Error:", rpcError);
        
      console.log("DASHBOARD DEBUG: Fetching subscription data from Supabase for user", user.id);
      
      // Try using the RPC function first
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_user_subscription', { user_id: userIdString });
      
      if (!rpcError && rpcData && rpcData.length > 0) {
        console.log("DASHBOARD DEBUG: RPC returned subscription data:", rpcData[0]);
        const subscriptionData = rpcData[0];
        
        setSubscriptionData({
          status: subscriptionData.subscription_status || 'inactive',
          eventsQuota: subscriptionData.subscription_events_quota || 0,
          eventsUsed: subscriptionData.subscription_events_used || 0,
          trialEndsAt: subscriptionData.subscription_trial_ends_at ? new Date(subscriptionData.subscription_trial_ends_at) : undefined
        });
      } else {
        // Fallback to direct query if RPC fails
        console.log("DASHBOARD DEBUG: RPC failed, falling back to direct query. Error:", rpcError);
        
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('subscription_status, subscription_events_quota, subscription_events_used, subscription_trial_ends_at')
        .eq('id', userIdString)
        .maybeSingle();
        
      if (!userError && userData) {
        console.log("DASHBOARD DEBUG: Supabase subscription data:", userData);
        console.log("DASHBOARD DEBUG: Supabase subscription data:", userData);
        // Store the subscription data
        setSubscriptionData({
          status: userData.subscription_status || 'inactive',
          eventsQuota: userData.subscription_events_quota || 0,
          eventsUsed: userData.subscription_events_used || 0,
          trialEndsAt: userData.subscription_trial_ends_at ? new Date(userData.subscription_trial_ends_at) : undefined
        });
      } else {
        console.log("DASHBOARD DEBUG: Error or no data from Supabase:", userError);
      }
      }
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

    console.log("DASHBOARD DEBUG: Registering for event", eventId, "User ID:", user.id, "Type:", typeof user.id);
    
    // Get latest subscription data from Supabase
    const userIdString = user.id.toString();
    console.log("DASHBOARD DEBUG: Using user ID string:", userIdString);
    
    // Try using the RPC function first
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_user_subscription', { user_id: userIdString });
    
    let userData = null;
    let userError = null;
    
    if (!rpcError && rpcData && rpcData.length > 0) {
      console.log("DASHBOARD DEBUG: RPC returned subscription data:", rpcData[0]);
      userData = rpcData[0];
    } else {
      // Fallback to direct query if RPC fails
      console.log("DASHBOARD DEBUG: RPC failed, falling back to direct query. Error:", rpcError);
      
      const result = await supabase
        .from('users')
        .select('subscription_status, subscription_events_quota, subscription_events_used')
        .eq('id', userIdString)
        .maybeSingle();
        
      userData = result.data;
      userError = result.error;
      
      console.log("DASHBOARD DEBUG: Direct query result:", userData, userError);
    }
      
    const eventsUsed = userData?.subscription_events_used || user.subscription.eventsUsed;
    const eventsQuota = userData?.subscription_events_quota || user.subscription.eventsQuota;
    
    console.log("DASHBOARD DEBUG: Current usage:", eventsUsed, "/", eventsQuota);
    
    console.log("DASHBOARD DEBUG: Current usage:", eventsUsed, "/", eventsQuota);
    
    if (eventsUsed >= eventsQuota) {
      toast.error('You have reached your event quota. Please upgrade your subscription.');
      return;
    }

    const event = upcomingEvents.find(e => e.id === eventId);
    if (!event) return;

    console.log("DASHBOARD DEBUG: Found event:", event.title, "ID:", eventId);

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
    } catch (error: any) {
      console.error('Failed to register for event:', error, error.stack);
      toast.error(`Failed to register for event: ${error.message || 'Please try again.'}`);
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
                {subscriptionData
                  ? `${Math.max(0, subscriptionData.eventsQuota - subscriptionData.eventsUsed)} / ${subscriptionData.eventsQuota}`
                  : user?.subscription
                    ? `${Math.max(0, user.subscription.eventsQuota - user.subscription.eventsUsed)} / ${user.subscription.eventsQuota}`
                    : '0 / 0'
                }
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full"
                style={{
                  width: `${(() => {
                    // Calculate percentage with safety checks
                    if (subscriptionData && subscriptionData.eventsQuota > 0) {
                      return Math.min(100, (subscriptionData.eventsUsed / subscriptionData.eventsQuota) * 100);
                    } else if (user?.subscription && user.subscription.eventsQuota > 0) {
                      return Math.min(100, (user.subscription.eventsUsed / user.subscription.eventsQuota) * 100);
                    } else {
                      return 0;
                    }
                  })()}%`
                }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Subscription Status: <span className="capitalize font-medium">{subscriptionData?.status || user?.subscription.status}</span>
              {subscriptionData?.trialEndsAt && subscriptionData.status === 'trial' && (
                <span className="ml-2 text-blue-600">
                  (Ends {subscriptionData.trialEndsAt.toLocaleDateString()})
                </span>
              )}
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