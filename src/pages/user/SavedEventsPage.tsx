import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { EventCard } from '../../components/common/EventCard';

export function SavedEventsPage() {
  const savedEvents = [
    {
      id: '1',
      title: 'Sales Leadership Summit',
      description: 'Join top sales leaders for insights and networking',
      date: new Date('2024-05-15T14:00:00'),
      maxParticipants: 50,
      currentParticipants: 35,
      meetLink: 'https://meet.google.com/abc-def-ghi'
    },
    {
      id: '2',
      title: 'Tech Sales Masterclass',
      description: 'Learn advanced techniques for selling technology solutions',
      date: new Date('2024-05-20T15:00:00'),
      maxParticipants: 30,
      currentParticipants: 25,
      meetLink: 'https://meet.google.com/jkl-mno-pqr'
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Saved Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedEvents.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              description={event.description}
              date={event.date}
              maxParticipants={event.maxParticipants}
              currentParticipants={event.currentParticipants}
              meetLink={event.meetLink}
              isRegistered={false}
              onRegister={() => {}}
            />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}