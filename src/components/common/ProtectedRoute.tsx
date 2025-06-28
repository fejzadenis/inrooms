import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { LoadingSpinner } from './LoadingSpinner';
import { EmailVerificationBanner } from '../auth/EmailVerificationBanner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
}

export function ProtectedRoute({ children, requireEmailVerification = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if email verification is required for this route
  if (requireEmailVerification && authService.requiresEmailVerification(user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <EmailVerificationBanner user={user} />
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Please verify your email address to access this feature.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show verification banner for unverified users but still allow access
  const showVerificationBanner = authService.requiresEmailVerification(user);

  return (
    <>
      {showVerificationBanner && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <EmailVerificationBanner user={user} />
          </div>
        </div>
      )}
      {children}
    </>
  );
}