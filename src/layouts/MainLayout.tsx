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
  Sparkles,
  Menu,
  X,
  Award,
  Shield,
  RefreshCw
} from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../contexts/AuthContext';
import { useTour } from '../contexts/TourContext';
import { Button } from '../components/common/Button';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { askForTourPermission, startTour } = useTour();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const notificationsRef = React.useRef<HTMLDivElement>(null);
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);

  // Check if we should show the tour when the user first logs in
  React.useEffect(() => {
    const checkTourStatus = async () => {
      if (user && location.pathname !== '/onboarding') {
        // Ask for permission before starting the tour
        const shouldStart = await askForTourPermission('main');
        if (shouldStart) {
          // Small delay to ensure the UI is fully rendered
          setTimeout(() => {
            startTour('main');
          }, 1000);
        }
      }
    };

    checkTourStatus();
  }, [user, location.pathname, askForTourPermission, startTour]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && 
          !(event.target as Element).closest('[data-mobile-menu-toggle]')) {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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

  const navigationItems = [
    { name: 'Events', href: '/events', dataTour: 'events' },
    { name: 'Network', href: '/network', dataTour: 'network' },
    { name: 'Courses', href: '/courses/business-formation', dataTour: 'courses' },
    { name: 'Product Showcase', href: '/solutions', dataTour: 'solutions' },
    { name: 'FAQ', href: '/faq', dataTour: 'resources' },
    { name: 'Reputation', href: '/reputation', dataTour: 'reputation' }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <Logo />
              </Link>

              {/* Desktop Navigation */}
              {user && (
                <div className="hidden md:flex items-center space-x-4 ml-6" data-tour="navigation">
                  {navigationItems.map(item => (
                    <Link 
                      key={item.name}
                      to={item.href} 
                      className={`text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                        location.pathname === item.href ? 'text-indigo-600 font-semibold' : ''
                      }`}
                      data-tour={item.dataTour}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              {user && (
                <button
                  className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  data-mobile-menu-toggle="true"
                  aria-label="Toggle mobile menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              )}

              {user ? (
                <>
                  <div className="relative" ref={notificationsRef} data-tour="notifications">
                    <button
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      className="p-2 rounded-full hover:bg-gray-100 relative"
                      aria-label="Notifications"
                    >
                      <Bell className="w-5 h-5 text-gray-600" />
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                    </button>

                    {isNotificationsOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
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

                  <div className="relative" ref={menuRef} data-tour="user-menu">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      aria-label="User menu"
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
                      <div className="text-right hidden sm:block">
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
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
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

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && user && (
          <div 
            className="md:hidden bg-white border-t border-gray-200 shadow-lg fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto"
            ref={mobileMenuRef}
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Navigation Links */}
              {navigationItems.map(item => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === item.href
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  data-tour={item.dataTour}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* User Menu Items */}
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="px-3 space-y-1">
                  {user.role === 'user' && userMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon className="w-5 h-5 mr-3 text-gray-500" />
                        {item.name}
                      </Link>
                    );
                  })}
                  
                  {user.role === 'admin' && (
                    <>
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Admin Controls
                      </div>
                      {adminMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Icon className="w-5 h-5 mr-3 text-gray-500" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </>
                  )}
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <LogOut className="w-5 h-5 mr-3 text-gray-500" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center gap-2">
                <img src="/logo colored.png" alt="inRooms" className="h-8 w-auto" />
                <span className="text-xl font-bold text-gray-900">inRooms</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                The premier networking platform for founders and builders
              </p>
            </div>
            <div className="flex space-x-6">
              <Link to="/privacy-policy" className="text-sm text-gray-500 hover:text-gray-900">
                Privacy Policy
              </Link>
              <Link to="/refund-policy" className="text-sm text-gray-500 hover:text-gray-900">
                Refund Policy
              </Link>
              <Link to="/terms" className="text-sm text-gray-500 hover:text-gray-900">
                Terms of Service
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 text-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} inRooms. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}