import React from 'react';
import { toast } from 'react-hot-toast';
import { AdminLayout } from '../../layouts/AdminLayout';
import { Button } from '../../components/common/Button';
import { EventManagementModal } from '../../components/admin/EventManagementModal';
import { StatsCard } from '../../components/admin/StatsCard';
import { UserManagement } from '../../components/admin/UserManagement';
import type { AdminDashboardStats } from '../../types/admin';

export function AdminDashboard() {
  const [events, setEvents] = React.useState([
    {
      id: '1',
      title: 'Enterprise Sales Strategies',
      description: 'Learn effective strategies for closing enterprise deals from industry experts.',
      date: new Date('2024-04-15T15:00:00'),
      participants: 3,
      maxParticipants: 6,
      meetLink: 'https://meet.google.com/abc-defg-hij',
    },
    {
      id: '2',
      title: 'Building Sales Relationships',
      description: 'Master the art of building and maintaining long-term client relationships.',
      date: new Date('2024-04-20T16:00:00'),
      participants: 5,
      maxParticipants: 6,
      meetLink: 'https://meet.google.com/xyz-uvwx-yz',
    },
  ]);

  const [users, setUsers] = React.useState([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      subscription: {
        status: 'trial' as const,
        eventsQuota: 5,
        eventsUsed: 2,
      },
      joinedAt: new Date('2024-03-01'),
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      subscription: {
        status: 'active' as const,
        eventsQuota: 12,
        eventsUsed: 4,
      },
      joinedAt: new Date('2024-02-15'),
    },
  ]);

  const [stats, setStats] = React.useState<AdminDashboardStats>({
    users: {
      totalUsers: 150,
      activeUsers: 120,
      trialUsers: 20,
      paidUsers: 110,
    },
    events: {
      totalEvents: 24,
      upcomingEvents: 8,
      pastEvents: 16,
      averageAttendance: 85,
    },
    revenueData: {
      monthly: 12500,
      yearly: 150000,
      growth: 15,
    },
  });

  const [isEventModalOpen, setIsEventModalOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<any>(null);

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: any) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleEventSubmit = async (data: any) => {
    try {
      const eventDateTime = new Date(`${data.date}T${data.time}`);
      const eventData = {
        ...data,
        date: eventDateTime,
        participants: selectedEvent?.participants || 0,
        id: selectedEvent?.id || Date.now().toString(),
      };

      if (selectedEvent) {
        setEvents(events.map(e => e.id === selectedEvent.id ? eventData : e));
        toast.success('Event updated successfully!');
      } else {
        setEvents([...events, eventData]);
        toast.success('Event created successfully!');
      }
    } catch (error) {
      console.error('Failed to save event:', error);
      toast.error('Failed to save event. Please try again.');
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(e => e.id !== eventId));
      toast.success('Event deleted successfully!');
    }
  };

  const handleUpdateQuota = (userId: string, adjustment: number) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          subscription: {
            ...user.subscription,
            eventsQuota: user.subscription.eventsQuota + adjustment,
          },
        };
      }
      return user;
    }));
    toast.success('User quota updated successfully!');
  };

  const handleSendEmail = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      toast.success(`Email notification sent to ${user.email}`);
    }
  };

  const handleDeactivateUser = (userId: string) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      setUsers(users.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            subscription: {
              ...user.subscription,
              status: 'inactive' as const,
            },
          };
        }
        return user;
      }));
      toast.success('User deactivated successfully!');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Users"
            value={stats.users.totalUsers}
            change={8}
            description="Total registered users"
          />
          <StatsCard
            title="Active Users"
            value={stats.users.activeUsers}
            change={5}
            description="Users active in last 30 days"
          />
          <StatsCard
            title="Monthly Revenue"
            value={`$${stats.revenueData.monthly.toLocaleString()}`}
            change={stats.revenueData.growth}
            description="Revenue this month"
          />
          <StatsCard
            title="Average Attendance"
            value={`${stats.events.averageAttendance}%`}
            change={3}
            description="Event attendance rate"
          />
        </div>

        {/* User Management */}
        <UserManagement
          users={users}
          onUpdateQuota={handleUpdateQuota}
          onSendEmail={handleSendEmail}
          onDeactivate={handleDeactivateUser}
        />

        {/* Events Management */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">Events</h2>
            <Button onClick={handleCreateEvent}>Create Event</Button>
          </div>
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meet Link
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {event.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {event.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {event.date.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {event.participants} / {event.maxParticipants}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={event.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {event.meetLink}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="outline"
                        onClick={() => handleEditEvent(event)}
                        className="mr-2"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <EventManagementModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSubmit={handleEventSubmit}
        initialData={selectedEvent ? {
          title: selectedEvent.title,
          description: selectedEvent.description,
          date: selectedEvent.date.toISOString().split('T')[0],
          time: selectedEvent.date.toTimeString().split(' ')[0].slice(0, 5),
          maxParticipants: selectedEvent.maxParticipants,
          meetLink: selectedEvent.meetLink,
        } : undefined}
      />
    </AdminLayout>
  );
}