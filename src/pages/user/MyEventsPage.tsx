import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { EventCard } from '../../components/common/EventCard';

export function MyEventsPage() {
  const [activeTab, setActiveTab] = React.useState<'upcoming' | 'past'>('upcoming');
  
  const mockEvents = {
    upcoming: [
      {
        id: '1',
        title: 'Enterprise Sales Workshop',
        description: 'Learn effective strategies for enterprise sales',
        date: new Date('2024-04-20T15:00:00'),
        maxParticipants: 10,
        currentParticipants: 8,
        meetLink: 'https://meet.google.com/abc-def-ghi'
      }
    ],
    past: [
      {
        id: '2',
        title: 'Sales Networking Event',
        description: 'Connect with other sales professionals',
        date: new Date('2024-03-15T14:00:00'),
        maxParticipants: 15,
        currentParticipants: 15,
        meetLink: 'https://meet.google.com/xyz-uvw-xyz'
      }
    ]
  };

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
              Upcoming Events
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`${
                activeTab === 'past'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Past Events
            </button>
          </nav>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockEvents[activeTab].map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              description={event.description}
              date={event.date}
              maxParticipants={event.maxParticipants}
              currentParticipants={event.currentParticipants}
              meetLink={event.meetLink}
              isRegistered={true}
              onJoin={() => window.open(event.meetLink, '_blank')}
            />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}