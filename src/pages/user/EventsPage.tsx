import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { EventCard } from '../../components/common/EventCard';
import { Search, Filter } from 'lucide-react';
import { Button } from '../../components/common/Button';

export function EventsPage() {
  const [category, setCategory] = React.useState('all');
  
  const events = [
    {
      id: '1',
      title: 'Enterprise Sales Summit',
      description: 'Join industry leaders for insights on enterprise sales strategies',
      date: new Date('2024-04-25T14:00:00'),
      maxParticipants: 50,
      currentParticipants: 35,
      category: 'sales',
      meetLink: 'https://meet.google.com/abc-def-ghi'
    },
    {
      id: '2',
      title: 'Tech Sales Networking',
      description: 'Connect with fellow tech sales professionals',
      date: new Date('2024-04-28T15:00:00'),
      maxParticipants: 30,
      currentParticipants: 20,
      category: 'networking',
      meetLink: 'https://meet.google.com/jkl-mno-pqr'
    },
    {
      id: '3',
      title: 'Sales Leadership Workshop',
      description: 'Develop your sales leadership skills',
      date: new Date('2024-05-02T16:00:00'),
      maxParticipants: 25,
      currentParticipants: 15,
      category: 'workshop',
      meetLink: 'https://meet.google.com/stu-vwx-yz'
    }
  ];

  const filteredEvents = category === 'all' 
    ? events 
    : events.filter(event => event.category === category);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Upcoming Events</h1>
          <Button>
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search events..."
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2">
          {['all', 'sales', 'networking', 'workshop'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                category === cat
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
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