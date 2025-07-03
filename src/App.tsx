import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { TourProvider } from './contexts/TourContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminProtectedRoute } from './components/common/AdminProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { ConfirmResetPasswordPage } from './pages/auth/ConfirmResetPasswordPage';
import { OnboardingFlow } from './pages/auth/OnboardingFlow';
import { SubscriptionPage } from './pages/subscription/SubscriptionPage';
import { DashboardPage } from './pages/user/DashboardPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ProfilePage } from './pages/user/ProfilePage';
import { MyEventsPage } from './pages/user/MyEventsPage';
import { MessagesPage } from './pages/user/MessagesPage';
import { SavedEventsPage } from './pages/user/SavedEventsPage';
import { BillingPage } from './pages/user/BillingPage';
import { HelpPage } from './pages/user/HelpPage';
import { DocsPage } from './pages/user/DocsPage';
import { EventsPage } from './pages/user/EventsPage';
import { NetworkPage } from './pages/user/NetworkPage';
import { ResourcesPage } from './pages/user/ResourcesPage';
import { NotificationsPage } from './pages/user/NotificationsPage';
import { AboutPage } from './pages/AboutPage';
import { LinkedInCallback } from './pages/LinkedInCallback';
import { SolutionsPage } from './pages/SolutionsPage';
import { MainTour } from './components/tour/MainTour';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative w-24 h-24 mx-auto mb-6">
              <motion.div 
                className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1, repeat: Infinity, repeatType: "reverse" }
                }}
              />
              <div className="absolute inset-2 bg-background rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold gradient-text">iR</span>
              </div>
            </div>
          </motion.div>
          <motion.h2 
            className="text-xl font-bold gradient-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            inRooms
          </motion.h2>
          <motion.p 
            className="text-gray-400 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Loading experience...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <TourProvider>
          <BackgroundCanvas />
          <MainTour />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/confirm-reset-password" element={<ConfirmResetPasswordPage />} />
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <OnboardingFlow />
                </ProtectedRoute>
              } />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/linkedin-callback" element={<LinkedInCallback />} />
              <Route path="/solutions" element={
                <ProtectedRoute>
                  <SolutionsPage />
                </ProtectedRoute>
              } />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:userId"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-events"
                element={
                  <ProtectedRoute>
                    <MyEventsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <MessagesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/saved-events"
                element={
                  <ProtectedRoute>
                    <SavedEventsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/billing"
                element={
                  <ProtectedRoute>
                    <BillingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/help"
                element={
                  <ProtectedRoute>
                    <HelpPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/docs"
                element={
                  <ProtectedRoute>
                    <DocsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events"
                element={
                  <ProtectedRoute>
                    <EventsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/network"
                element={
                  <ProtectedRoute>
                    <NetworkPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resources"
                element={
                  <ProtectedRoute>
                    <ResourcesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                }
              />
              {/* Catch-all route for 404 pages - redirect to login if not authenticated */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </AnimatePresence>
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: {
                background: 'rgba(15, 15, 25, 0.9)',
                color: '#fff',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }
            }}
          />
        </TourProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;