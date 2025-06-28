import React, { useState } from 'react';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { User } from 'firebase/auth';
import { Button } from '../common/Button';
import { authService } from '../../services/authService';

interface PostSignupEmailVerificationProps {
  user: User;
  onContinue: () => void;
}

export const PostSignupEmailVerification: React.FC<PostSignupEmailVerificationProps> = ({
  user,
  onContinue
}) => {
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await authService.sendEmailVerification(user);
    } catch (error) {
      // Error handling is done in the service
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    setIsChecking(true);
    try {
      await authService.reloadUser(user);
      if (user.emailVerified) {
        onContinue();
      } else {
        // Show a message that verification is still pending
        const toast = (await import('react-hot-toast')).toast;
        toast.error('Email not yet verified. Please check your inbox and click the verification link.');
      }
    } catch (error) {
      // Error handling is done in the service
    } finally {
      setIsChecking(false);
    }
  };

  const handleSkipForNow = () => {
    onContinue();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h2>
          
          <p className="text-gray-600 mb-6">
            We've sent a verification email to <strong>{user.email}</strong>. 
            Please check your inbox and click the verification link to activate your account.
          </p>

          <div className="space-y-3">
            <Button
              onClick={handleCheckVerification}
              isLoading={isChecking}
              className="w-full"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              I've Verified My Email
            </Button>

            <Button
              variant="outline"
              onClick={handleResendVerification}
              isLoading={isResending}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Resend Verification Email
            </Button>

            <Button
              variant="ghost"
              onClick={handleSkipForNow}
              className="w-full text-gray-500 hover:text-gray-700"
            >
              Skip for now
            </Button>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <p>
              Didn't receive the email? Check your spam folder or try resending.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};