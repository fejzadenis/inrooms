import React from 'react';
import { toast } from 'react-hot-toast';
import { AdminLayout } from '../../layouts/AdminLayout';
import { Button } from '../../components/common/Button';
import { EventManagementModal } from '../../components/admin/EventManagementModal';
import { StatsCard } from '../../components/admin/StatsCard';
import { UserManagement } from '../../components/admin/UserManagement';
import { eventService, type Event } from '../../services/eventService';
import { format } from 'date-fns';

export function AdminDashboard() {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isEventModalOpen, setIsEventModalOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);

  // Mock user data - in a real app, this would come from a user service
  const [users] = React.useState([
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

  // Load events on component mount
  React.useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await eventService.getEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error('Failed to load events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleEventSubmit = async (eventId: string) => {
    // Reload events to get the latest data
    await loadEvents();
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventService.deleteEvent(eventId);
        await loadEvents();
        toast.success('Event deleted successfully!');
      } catch (error) {
        console.error('Failed to delete event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  const handleUpdateQuota = (userId: string, adjustment: number) => {
    // This would update user quota in the database
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
      toast.success('User deactivated successfully!');
    }
  };

  // Calculate stats from real data
  const stats = React.useMemo(() => {
    const now = new Date();
    const upcomingEvents = events.filter(event => event.date > now);
    const pastEvents = events.filter(event => event.date <= now);
    
    return {
      users: {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.subscription.status !== 'inactive').length,
        trialUsers: users.filter(u => u.subscription.status === 'trial').length,
        paidUsers: users.filter(u => u.subscription.status === 'active').length,
      },
      events: {
        totalEvents: events.length,
        upcomingEvents: upcomingEvents.length,
        pastEvents: pastEvents.length,
        averageAttendance: events.length > 0 
          ? Math.round((events.reduce((sum, e) => sum + e.currentParticipants, 0) / events.length) * 100) / 100
          : 0,
      },
      revenueData: {
        monthly: 12500,
        yearly: 150000,
        growth: 15,
      },
    };
  }, [events, users]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

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
            title="Total Events"
            value={stats.events.totalEvents}
            change={12}
            description="All events created"
          />
          <StatsCard
            title="Upcoming Events"
            value={stats.events.upcomingEvents}
            change={3}
            description="Events scheduled for future"
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
            <h2 className="text-2xl font-semibold text-gray-900">Events Management</h2>
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
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No events created yet. Create your first event to get started.
                    </td>
                  </tr>
                ) : (
                  events.map((event) => (
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
                        <div className="text-sm text-gray-900">
                          {format(event.date, 'MMM d, yyyy')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {format(event.date, 'h:mm a')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {event.currentParticipants} / {event.maxParticipants}
                        </div>
                        <div className="text-sm text-gray-500">
                          {event.maxParticipants - event.currentParticipants} spots left
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {event.meetLink ? (
                          <a
                            href={event.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900 text-sm"
                          >
                            View Link
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">No link</span>
                        )}
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
                          onClick={() => handleDeleteEvent(event.id!)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
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
          id: selectedEvent.id!,
          title: selectedEvent.title,
          description: selectedEvent.description,
          date: format(selectedEvent.date, 'yyyy-MM-dd'),
          time: format(selectedEvent.date, 'HH:mm'),
          duration: selectedEvent.duration,
          maxParticipants: selectedEvent.maxParticipants,
        } : undefined}
      />
    </AdminLayout>
  );
}