import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut,
  ChevronDown,
  BarChart3,
  Users,
  Settings,
  CalendarDays,
  UserCircle,
  Bell,
  MessageSquare,
  Bookmark,
  HelpCircle,
  FileText,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const notificationsRef = React.useRef<HTMLDivElement>(null);

  const userMenuItems = [
    { name: 'Profile', href: '/profile', icon: UserCircle },
    { name: 'My Events', href: '/my-events', icon: CalendarDays },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Saved Events', href: '/saved-events', icon: Bookmark },
    { name: 'Billing', href: '/billing', icon: CreditCard },
    { name: 'Help Center', href: '/help', icon: HelpCircle },
    { name: 'Documentation', href: '/docs', icon: FileText },
  ];

  const adminMenuItems = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Events', href: '/admin/events', icon: CalendarDays },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const mockNotifications = [
    {
      id: 1,
      title: 'New Event Available',
      message: 'Enterprise Sales Workshop starting in 2 days',
      time: '2 hours ago',
    },
    {
      id: 2,
      title: 'Event Reminder',
      message: 'Your next networking event starts in 1 hour',
      time: '1 hour ago',
    },
  ];

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex-shrink-0">
              <Logo />
            </Link>

            {user && (
              <div className="hidden md:flex items-center space-x-4">
                <Link to="/events" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Events
                </Link>
                <Link to="/network" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Network
                </Link>
                <Link to="/solutions" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Solutions
                </Link>
                <Link to="/resources" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Resources
                </Link>
              </div>
            )}
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="relative" ref={notificationsRef}>
                    <button
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      className="p-2 rounded-full hover:bg-gray-100 relative"
                    >
                      <Bell className="w-5 h-5 text-gray-600" />
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                    </button>

                    {isNotificationsOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="p-4">
                          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                          <div className="mt-2 divide-y divide-gray-100">
                            {mockNotifications.map((notification) => (
                              <div key={notification.id} className="py-3">
                                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                <p className="text-sm text-gray-500">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                              </div>
                            ))}
                          </div>
                          <Link
                            to="/notifications"
                            className="block mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            View all notifications
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <UserCircle className="w-5 h-5 text-indigo-600" />
                        </div>
                      )}
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.role === 'admin' ? 'Administrator' : 'User'}
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isMenuOpen ? 'transform rotate-180' : ''}`} />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="py-1">
                          {user.role === 'user' && userMenuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.href;
                            return (
                              <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-4 py-2 text-sm ${
                                  isActive
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                                onClick={() => setIsMenuOpen(false)}
                              >
                                <Icon className="w-4 h-4 mr-3" />
                                {item.name}
                              </Link>
                            );
                          })}

                          {user.role === 'admin' && (
                            <>
                              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Admin Controls
                              </div>
                              {adminMenuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.href;
                                return (
                                  <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center px-4 py-2 text-sm ${
                                      isActive
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                    onClick={() => setIsMenuOpen(false)}
                                  >
                                    <Icon className="w-4 h-4 mr-3" />
                                    {item.name}
                                  </Link>
                                );
                              })}
                              <div className="border-t border-gray-100 my-1"></div>
                            </>
                          )}
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link to="/login">
                  <Button variant="primary">Login</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}