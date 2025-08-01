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
  
  console.log("ROUTE DEBUG: ProtectedRoute check", {
    path: location.pathname,
    loading,
    userExists: !!user,
    emailVerified: user?.emailVerified,
    dbEmailVerified: user?.dbEmailVerified,
    onboardingCompleted: user?.profile?.onboardingCompleted,
    requireEmailVerification
  });

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
    console.log("ROUTE DEBUG: No user, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isOnboardingRoute = location.pathname === '/onboarding';
  const isVerifyEmailRoute = location.pathname === '/verify-email';
  
  console.log("ROUTE DEBUG: Route checks", {
    isOnboardingRoute,
    isVerifyEmailRoute
  });

  // Allow onboarding route to bypass email verification check
  if (isOnboardingRoute) {
    console.log("ROUTE DEBUG: On onboarding route, allowing access");
    return <>{children}</>;
  }

  // Enforce email verification if required
  // Skip verification for admin@inrooms.com
  const isAdminEmail = user.email === 'admin@inrooms.com';
  if (requireEmailVerification && !user.emailVerified && !user.dbEmailVerified && !isVerifyEmailRoute && !isAdminEmail) {
    console.log("ROUTE DEBUG: Email verification required but not verified in either Firebase or DB, redirecting to verify-email");
    return <Navigate to="/verify-email" replace />;
  }

  // Redirect to onboarding if email is verified but onboarding not completed
  if ((user.emailVerified || user.dbEmailVerified) && !user.profile?.onboardingCompleted && !isOnboardingRoute) {
    console.log("ROUTE DEBUG: Email verified (Firebase or DB) but onboarding not completed, redirecting to onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  console.log("ROUTE DEBUG: All checks passed, rendering protected content");
  // All checks passed; render the protected content
  return <>{children}</>;
}
