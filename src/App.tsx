import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { TourProvider } from './contexts/TourContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminProtectedRoute } from './components/common/AdminProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
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
import { ResourcesPage } from './pages/ResourcesPage';
import { NotificationsPage } from './pages/user/NotificationsPage';
import { AboutPage } from './pages/AboutPage';
import { LinkedInCallback } from './pages/LinkedInCallback';
import { SolutionsPage } from './pages/SolutionsPage';
import { ReputationPage } from './pages/ReputationPage';
import { MainTour } from './components/tour/MainTour';
import { PrivacyPolicyPage } from './pages/legal/PrivacyPolicyPage';
import { RefundPolicyPage } from './pages/legal/RefundPolicyPage';
import { TermsPage } from './pages/legal/TermsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TourProvider>
          <MainTour />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
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
              <ProtectedRoute requireEmailVerification={true}>
                <SolutionsPage />
              </ProtectedRoute>
            } />
            <Route path="/reputation" element={<ReputationPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute requireEmailVerification={true}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:userId"
              element={
                <ProtectedRoute requireEmailVerification={true}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-events"
              element={
                <ProtectedRoute requireEmailVerification={true}>
                  <MyEventsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute requireEmailVerification={true}>
                  <MessagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saved-events"
              element={
                <ProtectedRoute requireEmailVerification={true}>
                  <SavedEventsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute requireEmailVerification={true}>
                  <BillingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/help"
              element={
                <ProtectedRoute requireEmailVerification={true}>
                  <HelpPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/docs"
              element={
                <ProtectedRoute requireEmailVerification={true}>
                  <DocsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute requireEmailVerification={true}>
                  <EventsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/network"
              element={
                <ProtectedRoute requireEmailVerification={true}>
                  <NetworkPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faq"
              element={
                <ProtectedRoute requireEmailVerification={true}>
                  <ResourcesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute requireEmailVerification={true}>
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
          <Toaster position="top-right" />
        </TourProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;