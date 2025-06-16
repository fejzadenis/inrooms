import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Bell, Calendar, Users, MessageSquare, Star, Settings } from 'lucide-react';
import { Button } from '../../components/common/Button';

interface Notification {
  id: string;
  type: 'event' | 'connection' | 'message' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  action?: {
    text: string;
    href: string;
  };
}

export function NotificationsPage() {
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = React.useState<Notification[]>([
    {
      id: '1',
      type: 'event',
      title: 'Upcoming Event Reminder',
      message: 'Enterprise Sales Workshop starts in 2 hours',
      time: '2 hours ago',
      read: false,
      action: {
        text: 'Join Now',
        href: '/events/1'
      }
    },
    {
      id: '2',
      type: 'connection',
      title: 'New Connection Request',
      message: 'Sarah Johnson wants to connect with you',
      time: '3 hours ago',
      read: false,
      action: {
        text: 'View Profile',
        href: '/network'
      }
    },
    {
      id: '3',
      type: 'message',
      title: 'New Message',
      message: 'John Smith sent you a message',
      time: '5 hours ago',
      read: true,
      action: {
        text: 'Reply',
        href: '/messages'
      }
    },
    {
      id: '4',
      type: 'system',
      title: 'Subscription Update',
      message: 'Your free trial ends in 2 days',
      time: '1 day ago',
      read: true,
      action: {
        text: 'View Plans',
        href: '/billing'
      }
    }
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="h-5 w-5" />;
      case 'connection':
        return <Users className="h-5 w-5" />;
      case 'message':
        return <MessageSquare className="h-5 w-5" />;
      case 'system':
        return <Star className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Stay updated with your network and events
                </p>
              </div>
              <div className="flex space-x-4">
                <Button variant="outline" onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}>
                  {filter === 'all' ? 'Show Unread' : 'Show All'}
                </Button>
                <Button variant="outline" onClick={handleMarkAllRead}>
                  Mark All as Read
                </Button>
                <Button variant="outline">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start p-4 rounded-lg ${
                    notification.read ? 'bg-white' : 'bg-indigo-50'
                  }`}
                >
                  <div className={`flex-shrink-0 ${
                    notification.read ? 'text-gray-400' : 'text-indigo-600'
                  }`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${
                        notification.read ? 'text-gray-900' : 'text-indigo-900'
                      }`}>
                        {notification.title}
                      </p>
                      <span className="text-sm text-gray-500">{notification.time}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                    {notification.action && (
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          className="text-sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          {notification.action.text}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}