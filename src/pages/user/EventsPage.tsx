import React, { useEffect } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { EventCard } from '../../components/common/EventCard';
import { Search, Filter } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { eventService, type Event } from '../../services/eventService';
import { useAuth } from '../../contexts/AuthContext';
import { useTour } from '../../contexts/TourContext';
import { toast } from 'react-hot-toast';
import { generateCalendarEvent } from '../../utils/calendar';

export function EventsPage() {
  const { user } = useAuth();
  const { askForTourPermission, startTour } = useTour();
  const [events, setEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [registeredEvents, setRegisteredEvents] = React.useState<string[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');

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
    
    try {
      const registrations = await eventService.getUserRegistrations(user.id);
      setRegisteredEvents(registrations.map(reg => reg.eventId));
    } catch (error) {
      console.error('Failed to load user registrations:', error);
    }
  };

  const handleRegister = async (eventId: string) => {
    if (!user) {
      toast.error('Please log in to register for events');
      return;
    }

    if (user.subscription.eventsUsed >= user.subscription.eventsQuota) {
      toast.error('You have reached your event quota. Please upgrade your subscription.');
      return;
    }

    const event = events.find(e => e.id === eventId);
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
      await loadEvents(); // Reload to update counts
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
                  {(user?.subscription.eventsQuota || 0) - (user?.subscription.eventsUsed || 0)} events remaining this month
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-indigo-900">
                  {user?.subscription.eventsUsed || 0} / {user?.subscription.eventsQuota || 0}
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