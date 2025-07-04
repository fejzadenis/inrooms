import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { Logo } from '../../components/common/Logo';
import { CheckCircle, XCircle, Loader, Mail, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { sendEmailVerification } from 'firebase/auth';
import { toast } from 'react-hot-toast';

export function VerifyEmailPage() {
  const { verifyEmail, user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const actionCode = searchParams.get('oobCode');
    
    if (actionCode) {
      // We have an action code, so we're verifying an email
      const verifyUserEmail = async () => {
        try {
          await verifyEmail(actionCode);
          setSuccess(true);
          // Add a delay before redirecting to login
          setTimeout(() => {
            navigate('/login?emailVerified=true');
          }, 3000);
        } catch (err: any) {
          console.error('Verification error:', err);
          setError(err.message || 'Failed to verify email. The link may have expired.');
        } finally {
          setVerifying(false);
        }
      };

      verifyUserEmail();
    } else {
      // No action code, so we're just showing the verification instructions
      setVerifying(false);
    }
  }, [searchParams, verifyEmail, navigate]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  const handleResendVerification = async () => {
    if (!user || resendDisabled) return;
    
    try {
      await sendEmailVerification(auth.currentUser!);
      toast.success('Verification email sent! Please check your inbox.');
      setResendDisabled(true);
      setCountdown(60); // Disable for 60 seconds
    } catch (err: any) {
      console.error('Error sending verification email:', err);
      toast.error(err.message || 'Failed to send verification email');
    }
  };

  const actionCode = searchParams.get('oobCode');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="mt-6 bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100">
          {actionCode ? (
            <div className="text-center">
              {verifying ? (
                <>
                  <div className="flex justify-center mb-4">
                    <Loader className="h-12 w-12 text-indigo-600 animate-spin" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Verifying Your Email
                  </h2>
                  <p className="text-gray-600">
                    Please wait while we verify your email address...
                  </p>
                </>
              ) : success ? (
                <>
                  <div className="flex justify-center mb-4">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Email Verified Successfully!
                  </h2>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-green-800">
                      Your email has been verified. You will be redirected to the login page in a moment.
                    </p>
                  </div>
                  <Link to="/login">
                    <Button className="w-full">
                      Continue to Login
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex justify-center mb-4">
                    <XCircle className="h-12 w-12 text-red-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Verification Failed
                  </h2>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800">
                      {error || 'There was a problem verifying your email. The link may have expired.'}
                    </p>
                  </div>
                  <Link to="/login">
                    <Button variant="outline" className="w-full mb-3">
                      Return to Login
                    </Button>
                  </Link>
                  <p className="text-sm text-gray-600">
                    Need a new verification link? <Link to="/login" className="text-indigo-600 hover:text-indigo-500">Sign in</Link> to request one.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Mail className="h-12 w-12 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Verify Your Email
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800">
                  We've sent a verification email to <strong>{user?.email}</strong>. Please check your inbox and click the verification link to continue.
                </p>
              </div>
              <p className="text-gray-600 mb-6">
                If you don't see the email, check your spam folder or click the button below to resend the verification email.
              </p>
              <Button 
                onClick={handleResendVerification} 
                disabled={resendDisabled}
                className="w-full mb-4"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {resendDisabled 
                  ? `Resend Email (${countdown}s)` 
                  : 'Resend Verification Email'}
              </Button>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Return to Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}