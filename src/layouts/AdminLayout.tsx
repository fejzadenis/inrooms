import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  CalendarDays, 
  Users, 
  BarChart3, 
  Settings, 
  MessageSquare,
  CreditCard,
  Bell
} from 'lucide-react';
import { MainLayout } from './MainLayout';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/admin', 
      icon: BarChart3,
      description: 'Overview and analytics'
    },
    { 
      name: 'Events', 
      href: '/admin/events', 
      icon: CalendarDays,
      description: 'Manage networking events'
    },
    { 
      name: 'Users', 
      href: '/admin/users', 
      icon: Users,
      description: 'User management'
    },
    { 
      name: 'Subscriptions', 
      href: '/admin/subscriptions', 
      icon: CreditCard,
      description: 'Manage plans and billing'
    },
    { 
      name: 'Communications', 
      href: '/admin/communications', 
      icon: MessageSquare,
      description: 'Email and notifications'
    },
    { 
      name: 'Notifications', 
      href: '/admin/notifications', 
      icon: Bell,
      description: 'System notifications'
    },
    { 
      name: 'Settings', 
      href: '/admin/settings', 
      icon: Settings,
      description: 'Platform configuration'
    }
  ];

  return (
    <MainLayout>
      <div className="flex gap-6">
        <aside className="w-64 bg-white rounded-lg shadow-sm p-4 h-[calc(100vh-7rem)] sticky top-24">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors duration-200 group ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${
                    isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  <div>
                    <div className={`font-medium ${
                      isActive ? 'text-indigo-600' : 'text-gray-900'
                    }`}>
                      {item.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </MainLayout>
  );
}