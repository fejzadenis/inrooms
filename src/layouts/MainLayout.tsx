import React, { useEffect, useState } from 'react';
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
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../contexts/AuthContext';
import { useTour } from '../contexts/TourContext';
import { Button } from '../components/common/Button';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { askForTourPermission, startTour } = useTour();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    { name: 'Products', href: '/solutions', dataTour: 'solutions' },
    { name: 'FAQ', href: '/resources', dataTour: 'resources' }
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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Animated background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-black"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/3 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-gray-900/80 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <Logo />
              </Link>

              {/* Desktop Navigation */}
              {user && (
                <div className="hidden md:flex items-center space-x-1 ml-6" data-tour="navigation">
                  {navigationItems.map(item => (
                    <Link 
                      key={item.name}
                      to={item.href} 
                      className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 group overflow-hidden ${
                        location.pathname === item.href 
                          ? 'text-white' 
                          : 'text-gray-300 hover:text-white'
                      }`}
                      data-tour={item.dataTour}
                    >
                      <span className="relative z-10">{item.name}</span>
                      {location.pathname === item.href && (
                        <motion.span 
                          layoutId="navbar-indicator"
                          className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-md -z-0"
                          transition={{ type: "spring", duration: 0.6 }}
                        />
                      )}
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              {user && (
                <button
                  className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
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
                      className="p-2 rounded-full hover:bg-gray-800 relative"
                      aria-label="Notifications"
                    >
                      <Bell className="w-5 h-5 text-gray-300" />
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-gray-900" />
                    </button>

                    <AnimatePresence>
                      {isNotificationsOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 border border-gray-700"
                        >
                          <div className="p-4">
                            <h3 className="text-sm font-semibold text-white">Notifications</h3>
                            <div className="mt-2 divide-y divide-gray-700">
                              {mockNotifications.map((notification) => (
                                <div key={notification.id} className="py-3">
                                  <p className="text-sm font-medium text-white">{notification.title}</p>
                                  <p className="text-sm text-gray-400">{notification.message}</p>
                                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                </div>
                              ))}
                            </div>
                            <Link
                              to="/notifications"
                              className="block mt-4 text-sm font-medium text-blue-400 hover:text-blue-300"
                            >
                              View all notifications
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative" ref={menuRef} data-tour="user-menu">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                      aria-label="User menu"
                    >
                      {user.photoURL ? (
                        <div className="relative">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-sm opacity-75"></div>
                          <img
                            src={user.photoURL}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover relative"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                          <UserCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium text-white">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {user.role === 'admin' ? 'Administrator' : 'User'}
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isMenuOpen ? 'transform rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isMenuOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 border border-gray-700"
                        >
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
                                      ? 'bg-gray-700 text-white'
                                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
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
                                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
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
                                          ? 'bg-gray-700 text-white'
                                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                      }`}
                                      onClick={() => setIsMenuOpen(false)}
                                    >
                                      <Icon className="w-4 h-4 mr-3" />
                                      {item.name}
                                    </Link>
                                  );
                                })}
                                <div className="border-t border-gray-700 my-1"></div>
                              </>
                            )}
                            <button
                              onClick={handleLogout}
                              className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                              <LogOut className="w-4 h-4 mr-3" />
                              Logout
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <Link to="/login">
                  <Button variant="primary" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && user && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-gray-800 border-t border-gray-700 shadow-lg fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto"
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
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    data-tour={item.dataTour}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* User Menu Items */}
                <div className="pt-4 pb-3 border-t border-gray-700">
                  <div className="px-3 space-y-1">
                    {user.role === 'user' && userMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Icon className="w-5 h-5 mr-3 text-gray-400" />
                          {item.name}
                        </Link>
                      );
                    })}
                    
                    {user.role === 'admin' && (
                      <>
                        <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Admin Controls
                        </div>
                        {adminMenuItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <Icon className="w-5 h-5 mr-3 text-gray-400" />
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
                      className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <LogOut className="w-5 h-5 mr-3 text-gray-400" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="relative z-10 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}