import React from 'react';
import { toast } from 'react-hot-toast';
import { MainLayout } from '../../layouts/MainLayout';
import { EventCard } from '../../components/common/EventCard';
import { useAuth } from '../../contexts/AuthContext';
import { generateCalendarEvent } from '../../utils/calendar';

// Mock data - replace with actual API calls
const mockEvents = [
  {
    id: '1',
    title: 'Enterprise Sales Strategies',
    description: 'Learn effective strategies for closing enterprise deals from industry experts.',
    date: new Date('2024-04-15T15:00:00'),
    maxParticipants: 6,
    currentParticipants: 3,
    meetLink: 'https://meet.google.com/abc-defg-hij',
  },
  {
    id: '2',
    title: 'Building Sales Relationships',
    description: 'Master the art of building and maintaining long-term client relationships.',
    date: new Date('2024-04-20T16:00:00'),
    maxParticipants: 6,
    currentParticipants: 5,
    meetLink: 'https://meet.google.com/xyz-uvwx-yz',
  },
];

export function DashboardPage() {
  const { user } = useAuth();
  const [registeredEvents, setRegisteredEvents] = React.useState<string[]>([]);

  const handleRegister = async (eventId: string) => {
    const event = mockEvents.find(e => e.id === eventId);
    if (!event) return;

    try {
      // Generate calendar event
      const icsFile = await generateCalendarEvent({
        title: event.title,
        description: event.description,
        startTime: event.date,
        duration: { hours: 1, minutes: 0 },
        location: event.meetLink,
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

      setRegisteredEvents((prev) => [...prev, eventId]);
      toast.success('Successfully registered! Check your calendar invite.');
    } catch (error) {
      console.error('Failed to generate calendar event:', error);
      toast.error('Failed to generate calendar invite. Please try again.');
    }
  };

  const handleJoinMeeting = (meetLink: string) => {
    window.open(meetLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900">Your Subscription</h2>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Events Remaining</span>
              <span className="text-lg font-medium text-gray-900">
                {user?.subscription.eventsQuota - user?.subscription.eventsUsed} / {user?.subscription.eventsQuota}
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
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockEvents.map((event) => (
              <EventCard
                key={event.id}
                title={event.title}
                description={event.description}
                date={event.date}
                maxParticipants={event.maxParticipants}
                currentParticipants={event.currentParticipants}
                meetLink={event.meetLink}
                isRegistered={registeredEvents.includes(event.id)}
                onRegister={() => handleRegister(event.id)}
                onJoin={() => handleJoinMeeting(event.meetLink)}
              />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}