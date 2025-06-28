import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { authService } from '../services/authService';

export const useEmailVerification = (user: User | null) => {
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [shouldShowVerification, setShouldShowVerification] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsEmailVerified(false);
      setShouldShowVerification(false);
      return;
    }

    setIsEmailVerified(user.emailVerified);
    setShouldShowVerification(authService.shouldShowEmailVerification(user));
  }, [user]);

  const refreshVerificationStatus = async () => {
    if (!user) return;
    
    try {
      await authService.reloadUser(user);
      setIsEmailVerified(user.emailVerified);
      setShouldShowVerification(authService.shouldShowEmailVerification(user));
    } catch (error) {
      console.error('Error refreshing verification status:', error);
    }
  };

  return {
    isEmailVerified,
    shouldShowVerification,
    refreshVerificationStatus
  };
};