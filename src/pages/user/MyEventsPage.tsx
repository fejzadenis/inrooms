import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { EventCard } from '../../components/common/EventCard';
import { useAuth } from '../../contexts/AuthContext';
import { eventService, type Event } from '../../services/eventService';
import { toast } from 'react-hot-toast';

export function MyEventsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'upcoming' | 'past'>('upcoming');
  const [events, setEvents] = React.useState<{ upcoming: Event[]; past: Event[] }>({
    upcoming: [],
    past: []
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (user) {
      loadUserEvents();
    }
  }, [user]);

  const loadUserEvents = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get user's registrations
      const registrations = await eventService.getUserRegistrations(user.id);
      const registeredEventIds = registrations.map(reg => reg.eventId);

      // Get all events
      const allEvents = await eventService.getEvents();
      
      // Filter events user is registered for
      const userEvents = allEvents.filter(event => registeredEventIds.includes(event.id!));
      
      // Separate into upcoming and past
      const now = new Date();
      const upcoming = userEvents.filter(event => {
        // Ensure event.date is a valid Date object
        const eventDate = event.date instanceof Date ? 
          event.date : new Date(event.date);
        return eventDate > now;
      });
      
      const past = userEvents.filter(event => {
        // Ensure event.date is a valid Date object
        const eventDate = event.date instanceof Date ? 
          event.date : new Date(event.date);
        return eventDate <= now;
      });

      // Sort upcoming events by date (closest first)
      upcoming.sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
      
      // Sort past events by date (most recent first)
      past.sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });
      setEvents({ upcoming, past });
    } catch (error) {
      console.error('Failed to load user events:', error);
      toast.error('Failed to load your events');
    } finally {
      setLoading(false);
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
          <div className="text-lg text-gray-600">Loading your events...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`${
                activeTab === 'upcoming'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Upcoming Events ({events.upcoming.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`${
                activeTab === 'past'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Past Events ({events.past.length})
            </button>
          </nav>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events[activeTab].length === 0 ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">
                No {activeTab} events
              </h3>
              <p className="text-gray-500 mt-2">
                {activeTab === 'upcoming' 
                  ? 'Register for events to see them here' 
                  : 'Your completed events will appear here'}
              </p>
            </div>
          ) : (
            events[activeTab].map((event) => (
              <EventCard
                key={event.id}
                title={event.title}
                description={event.description}
                date={event.date}
                maxParticipants={event.maxParticipants}
                currentParticipants={event.currentParticipants}
                meetLink={event.meetLink}
                isRegistered={true}
                onJoin={() => handleJoinMeeting(event.meetLink!)}
              />
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}