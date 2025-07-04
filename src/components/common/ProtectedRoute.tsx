import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
}

export function ProtectedRoute({
  children,
  requireEmailVerification = false,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth state is being resolved
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner className="w-8 h-8 text-indigo-600" />
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isOnboardingRoute = location.pathname === '/onboarding';
  const isVerifyEmailRoute = location.pathname === '/verify-email';

  // Allow onboarding route to bypass email verification check
  if (isOnboardingRoute) {
    return <>{children}</>;
  }

  // Enforce email verification if required
  if (requireEmailVerification && !user.emailVerified && !isVerifyEmailRoute) {
    return <Navigate to="/verify-email" replace />;
  }

  // Redirect to onboarding if email is verified but onboarding not completed
  if (user.emailVerified && !user.profile?.onboardingCompleted && !isOnboardingRoute) {
    return <Navigate to="/onboarding" replace />;
  }

  // All checks passed; render the protected content
  return <>{children}</>;
}
