import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { Logo } from '../../components/common/Logo';
import { Mail, RefreshCw, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export function EmailVerificationPage() {
  const { user, sendEmailVerification, logout } = useAuth();
  const navigate = useNavigate();
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Redirect if user is already verified
  useEffect(() => {
    if (user?.emailVerified) {
      console.log("User is verified, redirecting to onboarding");
      navigate('/onboarding');
    }
  }, [user, navigate]);

  // Set up countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  const handleResendEmail = async () => {
    try {
      await sendEmailVerification();
      setResendDisabled(true);
      setCountdown(60); // 60 second cooldown
      toast.success('Verification email sent! Please check your inbox and spam folder.');
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('Failed to send verification email. Please try again later.');
    }
  };

  const handleRefreshStatus = async () => {
    setRefreshing(true);
    try {
      // Force token refresh to get latest emailVerified status
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        await currentUser.reload();
        
        if (currentUser.emailVerified) {
          toast.success('Email verified successfully!');
          // Immediately redirect to onboarding
          setTimeout(() => {
            navigate('/onboarding');
          }, 500);
        } else {
          toast.error('Email not yet verified. Please check your inbox and click the verification link.');
        }
      }
    } catch (error) {
      console.error('Error refreshing verification status:', error);
      toast.error('Failed to refresh verification status. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify Your Email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please verify your email address to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="bg-indigo-100 rounded-full p-4">
              <Mail className="h-12 w-12 text-indigo-600" />
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">Verification Email Sent</h3>
              <p className="mt-2 text-sm text-gray-600">
                We've sent a verification email to <span className="font-medium">{user?.email}</span>
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Click the link in the email to verify your account and access the platform.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 w-full">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Important</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    You must verify your email before accessing the platform. If you don't see the email, please check your spam folder.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 w-full">
              <Button 
                onClick={handleRefreshStatus} 
                isLoading={refreshing}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                I've Verified My Email
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleResendEmail} 
                disabled={resendDisabled}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                {resendDisabled 
                  ? `Resend Email (${countdown}s)` 
                  : 'Resend Verification Email'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? <a href="mailto:support@inrooms.com" className="font-medium text-indigo-600 hover:text-indigo-500">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}