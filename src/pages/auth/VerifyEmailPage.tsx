import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { Logo } from '../../components/common/Logo';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

export function VerifyEmailPage() {
  const { verifyEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const actionCode = searchParams.get('oobCode');
    
    if (!actionCode) {
      setVerifying(false);
      setError('Invalid verification link. Please request a new verification email.');
      return;
    }

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
  }, [searchParams, verifyEmail, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="mt-6 bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100">
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
        </div>
      </div>
    </div>
  );
}