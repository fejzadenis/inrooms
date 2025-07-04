import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { Logo } from '../../components/common/Logo';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  
  // Check for verification success from URL params
  const verificationSuccess = searchParams.get('emailVerified') === 'true';
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Get the redirect path from location state
  const from = location.state?.from?.pathname || '/events';

  const checkOnboardingAndRedirect = async (userId: string) => {
    try {
      console.log("LOGIN DEBUG: Checking onboarding status for user", userId);
      // Get user document to check onboarding status
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("LOGIN DEBUG: User data retrieved", { 
          role: userData.role,
          onboardingCompleted: userData.profile?.onboardingCompleted,
          emailVerified: auth.currentUser?.emailVerified
        });
      
      // Check if email is verified in either Firebase or database
      const isEmailVerified = auth.currentUser?.emailVerified || userData.email_verified === true;

      // Check if email is verified
      if (!isEmailVerified) {
        console.log("LOGIN DEBUG: Email not verified in Firebase or DB, redirecting to verify-email");
        navigate('/verify-email');
        return;
      }
        
        // Check if user is admin
        if (userData.role === 'admin') {
          console.log("LOGIN DEBUG: User is admin, redirecting to admin dashboard");
          navigate('/admin');
          return;
        }
        
        // Check if onboarding is completed
        if (userData.profile?.onboardingCompleted) {
          console.log("LOGIN DEBUG: Onboarding completed, redirecting to", from);
          navigate(from);
        } else {
          console.log("LOGIN DEBUG: Onboarding not completed, redirecting to onboarding");
          navigate('/onboarding');
        }
      } else {
        // Default to onboarding if user document doesn't exist
        console.log("LOGIN DEBUG: User document doesn't exist, redirecting to onboarding");
        navigate('/onboarding');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to onboarding on error
      console.log("LOGIN DEBUG: Error checking onboarding status, defaulting to onboarding");
      navigate('/onboarding');
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      const userCredential = await login(data.email, data.password);
      // Use the returned user ID for redirection
      if (userCredential && userCredential.user) {
        await checkOnboardingAndRedirect(userCredential.user.uid);
      }
    } catch (error) {
      // Error is handled in the AuthContext
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const userCredential = await loginWithGoogle();
      // Use the returned user ID for redirection
      if (userCredential && userCredential.user) {
        await checkOnboardingAndRedirect(userCredential.user.uid);
      }
    } catch (error) {
      // AuthContext handles error display
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to your account to continue networking
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100">
          {verificationSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                Your email has been verified successfully! You can now log in.
              </p>
            </div>
          )}
          
          <div className="space-y-6">
            <GoogleSignInButton
              onClick={handleGoogleSignIn}
              isLoading={isGoogleLoading}
              variant="signin"
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    {...register('password')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                    placeholder="Enter your password"
                  />
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/reset-password" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isSubmitting}
                >
                  Sign in
                </Button>
              </div>
            </form>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  New to inRooms?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/signup">
                <Button variant="outline" className="w-full">
                  Create an account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}