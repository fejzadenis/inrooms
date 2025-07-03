import React, { useEffect, useState, useRef } from 'react';
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
  Rocket
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
  const [customCursor, setCustomCursor] = useState({ x: 0, y: 0, active: false });
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  // Check if we should show the tour when the user first logs in
  useEffect(() => {
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

  useEffect(() => {
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
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Custom cursor effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCustomCursor(prev => ({
        ...prev,
        x: e.clientX,
        y: e.clientY
      }));
    };

    const handleMouseDown = () => {
      setCustomCursor(prev => ({
        ...prev,
        active: true
      }));
    };

    const handleMouseUp = () => {
      setCustomCursor(prev => ({
        ...prev,
        active: false
      }));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

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
    { name: 'Events', href: '/events', dataTour: 'events', icon: CalendarDays },
    { name: 'Network', href: '/network', dataTour: 'network', icon: Users },
    { name: 'Products', href: '/solutions', dataTour: 'solutions', icon: Rocket },
    { name: 'FAQ', href: '/resources', dataTour: 'resources', icon: HelpCircle }
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Custom cursor */}
      <div 
        ref={cursorRef}
        className="custom-cursor hidden lg:block"
        style={{ 
          left: `${customCursor.x}px`, 
          top: `${customCursor.y}px`,
          transform: customCursor.active ? 'scale(0.5)' : 'scale(1)'
        }}
      />

      {/* Noise texture overlay */}
      <div className="noise"></div>

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass py-2' : 'py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <Logo />
              </Link>

              {/* Desktop Navigation */}
              {user && (
                <div className="hidden md:flex items-center space-x-1 ml-6" data-tour="navigation">
                  {navigationItems.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    
                    return (
                      <Link 
                        key={item.name}
                        to={item.href} 
                        className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 group ${
                          isActive 
                            ? 'text-primary-400 font-semibold' 
                            : 'text-gray-300 hover:text-white'
                        }`}
                        data-tour={item.dataTour}
                      >
                        <span className="flex items-center">
                          <Icon className="w-4 h-4 mr-2" />
                          {item.name}
                        </span>
                        {isActive && (
                          <motion.span 
                            layoutId="navbar-indicator"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                        <span className="absolute inset-0 rounded-md bg-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              {user && (
                <button
                  className="md:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-muted"
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
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      className="p-2 rounded-full hover:bg-muted relative"
                      aria-label="Notifications"
                    >
                      <Bell className="w-5 h-5 text-gray-300" />
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-accent-500 ring-2 ring-background" />
                    </motion.button>

                    <AnimatePresence>
                      {isNotificationsOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-80 glass rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                        >
                          <div className="p-4">
                            <h3 className="text-sm font-semibold text-white">Notifications</h3>
                            <div className="mt-2 divide-y divide-gray-700">
                              {mockNotifications.map((notification) => (
                                <div key={notification.id} className="py-3">
                                  <p className="text-sm font-medium text-white">{notification.title}</p>
                                  <p className="text-sm text-gray-300">{notification.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                                </div>
                              ))}
                            </div>
                            <Link
                              to="/notifications"
                              className="block mt-4 text-sm font-medium text-primary-400 hover:text-primary-300"
                            >
                              View all notifications
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative" ref={menuRef} data-tour="user-menu">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors duration-200"
                      aria-label="User menu"
                    >
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border-2 border-primary-500"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-900 flex items-center justify-center border-2 border-primary-500">
                          <UserCircle className="w-5 h-5 text-primary-300" />
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
                    </motion.button>

                    <AnimatePresence>
                      {isMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-56 glass rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50"
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
                                      ? 'bg-primary-900/50 text-primary-300'
                                      : 'text-gray-300 hover:bg-muted hover:text-white'
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
                                          ? 'bg-primary-900/50 text-primary-300'
                                          : 'text-gray-300 hover:bg-muted hover:text-white'
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
                              className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-muted hover:text-white"
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
                  <Button 
                    variant="neon" 
                    glowEffect="primary"
                    icon={<Sparkles className="w-4 h-4" />}
                  >
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
              className="md:hidden glass-dark fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto"
              ref={mobileMenuRef}
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {/* Navigation Links */}
                {navigationItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        location.pathname === item.href
                          ? 'bg-primary-900/50 text-primary-300'
                          : 'text-gray-300 hover:bg-muted hover:text-white'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      data-tour={item.dataTour}
                    >
                      <div className="flex items-center">
                        <Icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </div>
                    </Link>
                  );
                })}
                
                {/* User Menu Items */}
                <div className="pt-4 pb-3 border-t border-gray-700">
                  <div className="px-3 space-y-1">
                    {user.role === 'user' && userMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-muted hover:text-white"
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
                              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-muted hover:text-white"
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
                      className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-muted hover:text-white"
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

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {children}
      </main>

      {/* Footer */}
      <footer className="glass border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Logo />
              <p className="mt-4 text-sm text-gray-400">
                The premier networking platform for tech sales professionals.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><Link to="/events" className="text-sm text-gray-400 hover:text-white">Events</Link></li>
                <li><Link to="/network" className="text-sm text-gray-400 hover:text-white">Network</Link></li>
                <li><Link to="/solutions" className="text-sm text-gray-400 hover:text-white">Products</Link></li>
                <li><Link to="/resources" className="text-sm text-gray-400 hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-sm text-gray-400 hover:text-white">About</Link></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Terms</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Privacy</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Cookies</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Licenses</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} inRooms. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}