import React, { useState } from 'react';
import { Mail, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { Button } from '../common/Button';

export const EmailVerificationBanner: React.FC = () => {
  const { user } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show banner if user is not logged in, email is verified, or banner is dismissed
  if (!user || user.emailVerified || isDismissed) {
    return null;
  }

  const handleResendVerification = async () => {
    if (!user) return;
    
    setIsResending(true);
    try {
      await authService.sendEmailVerification(user);
    } catch (error) {
      // Error handling is done in the service
    } finally {
      setIsResending(false);
    }
  };

  const handleRefreshStatus = async () => {
    if (!user) return;
    
    try {
      await authService.reloadUser(user);
      // The auth context will automatically update when the user object changes
    } catch (error) {
      // Error handling is done in the service
    }
  };

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Mail className="h-5 w-5 text-amber-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-amber-800">
            Email Verification Required
          </h3>
          <p className="mt-1 text-sm text-amber-700">
            Please verify your email address to access all features. Check your inbox for a verification email.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleResendVerification}
              isLoading={isResending}
              className="text-amber-800 border-amber-300 hover:bg-amber-100"
            >
              <Mail className="w-4 h-4 mr-1" />
              Resend Email
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefreshStatus}
              className="text-amber-800 border-amber-300 hover:bg-amber-100"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              I've Verified
            </Button>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={() => setIsDismissed(true)}
            className="inline-flex text-amber-400 hover:text-amber-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};