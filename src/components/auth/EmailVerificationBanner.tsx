import React, { useState } from 'react';
import { Mail, X, RefreshCw } from 'lucide-react';
import { User } from 'firebase/auth';
import { Button } from '../common/Button';
import { authService } from '../../services/authService';
import { toast } from 'react-hot-toast';

interface EmailVerificationBannerProps {
  user: User;
  onDismiss?: () => void;
  className?: string;
}

export function EmailVerificationBanner({ user, onDismiss, className = '' }: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await authService.sendEmailVerification(user);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    setIsReloading(true);
    try {
      await authService.reloadUser(user);
      if (user.emailVerified) {
        toast.success('Email verified successfully!');
        onDismiss?.();
        // Reload the page to update the UI
        window.location.reload();
      } else {
        toast.error('Email not yet verified. Please check your inbox and click the verification link.');
      }
    } catch (error) {
      toast.error('Failed to check verification status');
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Mail className="h-5 w-5 text-amber-600" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-amber-800">
            Email Verification Required
          </h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>
              Please verify your email address to access all features. 
              We've sent a verification link to <strong>{user.email}</strong>.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
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
              onClick={handleCheckVerification}
              isLoading={isReloading}
              className="text-amber-800 border-amber-300 hover:bg-amber-100"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              I've Verified
            </Button>
          </div>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className="inline-flex rounded-md bg-amber-50 p-1.5 text-amber-500 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 focus:ring-offset-amber-50"
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}