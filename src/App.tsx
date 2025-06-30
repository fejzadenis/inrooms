import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { TourProvider } from './contexts/TourContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminProtectedRoute } from './components/common/AdminProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
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
import { useAuth } from './contexts/AuthContext';

function AppContent() {
  const { user, updateLastActivity } = useAuth();

  // Update last activity when the app loads
  useEffect(() => {
    if (user) {
      updateLastActivity();
    }
  }, [user, updateLastActivity]);

  return (
    <TourProvider>
      <MainTour />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/linkedin-callback" element={<LinkedInCallback />} />

        {/* Protected routes */}
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <OnboardingFlow />
          </ProtectedRoute>
        } />
        <Route path="/solutions" element={
          <ProtectedRoute>
            <SolutionsPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/profile/:userId" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/my-events" element={
          <ProtectedRoute>
            <MyEventsPage />
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        } />
        <Route path="/saved-events" element={
          <ProtectedRoute>
            <SavedEventsPage />
          </ProtectedRoute>
        } />
        <Route path="/billing" element={
          <ProtectedRoute>
            <BillingPage />
          </ProtectedRoute>
        } />
        <Route path="/help" element={
          <ProtectedRoute>
            <HelpPage />
          </ProtectedRoute>
        } />
        <Route path="/docs" element={
          <ProtectedRoute>
            <DocsPage />
          </ProtectedRoute>
        } />
        <Route path="/events" element={
          <ProtectedRoute>
            <EventsPage />
          </ProtectedRoute>
        } />
        <Route path="/network" element={
          <ProtectedRoute>
            <NetworkPage />
          </ProtectedRoute>
        } />
        <Route path="/resources" element={
          <ProtectedRoute>
            <ResourcesPage />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/*" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />
        
        {/* Catch-all route for 404 pages - redirect to login if not authenticated */}
        <Route path="*" element={user ? <Navigate to="/events" replace /> : <Navigate to="/login" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </TourProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;