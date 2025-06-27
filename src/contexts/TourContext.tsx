import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

interface TourContextType {
  isTourOpen: boolean;
  currentTour: string | null;
  tourStep: number;
  openTour: (tourName: string) => void;
  closeTour: () => void;
  startTour: (tourName: string) => void;
  completeTour: (tourName: string, userId?: string) => Promise<void>;
  askForTourPermission: (tourName: string) => Promise<boolean>;
  setTourStep: (step: number) => void;
  skipTour: () => void;
}

const TourContext = createContext<TourContextType>({
  isTourOpen: false,
  currentTour: null,
  tourStep: 0,
  openTour: () => {},
  closeTour: () => {},
  startTour: () => {},
  completeTour: async () => {},
  askForTourPermission: async () => false,
  setTourStep: () => {},
  skipTour: () => {},
});

export const useTour = () => useContext(TourContext);

interface TourProviderProps {
  children: React.ReactNode;
}

export const TourProvider: React.FC<TourProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [currentTour, setCurrentTour] = useState<string | null>(null);
  const [tourStep, setTourStep] = useState(0);
  const [askedForPermission, setAskedForPermission] = useState<Record<string, boolean>>({});
  const [hasShownInitialTour, setHasShownInitialTour] = useState(false);

  // Check if user is newly registered
  useEffect(() => {
    const checkIfNewUser = async () => {
      if (user && !hasShownInitialTour) {
        try {
          // Check if user has completedTours field
          const userRef = doc(db, 'users', user.id);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // If user has no completedTours field or it's empty, they're considered new
            const isNewUser = !userData.profile?.completedTours || 
                             Object.keys(userData.profile?.completedTours || {}).length === 0;
            
            // Only show tour for new users
            if (isNewUser) {
              setHasShownInitialTour(true);
            }
          }
        } catch (error) {
          console.error('Error checking if user is new:', error);
        }
      }
    };
    
    checkIfNewUser();
  }, [user, hasShownInitialTour]);

  const openTour = useCallback((tourName: string) => {
    setCurrentTour(tourName);
    setIsTourOpen(true);
    setTourStep(0);
  }, []);

  const closeTour = useCallback(() => {
    setIsTourOpen(false);
    setCurrentTour(null);
  }, []);

  const startTour = useCallback((tourName: string) => {
    openTour(tourName);
  }, [openTour]);

  const completeTour = useCallback(async (tourName: string, userId?: string) => {
    try {
      const id = userId || user?.id;
      if (!id) {
        throw new Error('userId is not defined');
      }

      const userRef = doc(db, 'users', id);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // Update the completedTours field
        await updateDoc(userRef, {
          [`profile.completedTours.${tourName}`]: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error marking tour as completed:', error);
      throw error;
    }
  }, [user]);

  const askForTourPermission = useCallback(async (tourName: string): Promise<boolean> => {
    // If we've already asked for this tour, don't ask again
    if (askedForPermission[tourName]) {
      return false;
    }

    // Only show tour for new users
    if (!hasShownInitialTour && tourName === 'main') {
      return false;
    }

    // Check if the tour has already been completed
    if (user) {
      try {
        const userRef = doc(db, 'users', user.id);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // If the tour is already completed, don't show it
          if (userData.profile?.completedTours?.[tourName]) {
            setAskedForPermission(prev => ({ ...prev, [tourName]: true }));
            return false;
          }
        }
      } catch (error) {
        console.error('Error checking tour completion status:', error);
        return false;
      }
    }

    // For newly registered users, automatically start the tour without asking
    if (user && user.profile?.onboardingCompleted && !user.profile?.completedTours?.[tourName]) {
      setAskedForPermission(prev => ({ ...prev, [tourName]: true }));
      return true;
    }

    // For all other cases, don't show the tour
    setAskedForPermission(prev => ({ ...prev, [tourName]: true }));
    return false;
  }, [user, askedForPermission, hasShownInitialTour]);

  const skipTour = useCallback(() => {
    if (currentTour && user) {
      completeTour(currentTour, user.id).catch(console.error);
      toast.success('Tour skipped. You can restart it from the help menu anytime.');
    }
    closeTour();
  }, [currentTour, user, completeTour, closeTour]);

  return (
    <TourContext.Provider
      value={{
        isTourOpen,
        currentTour,
        tourStep,
        openTour,
        closeTour,
        startTour,
        completeTour,
        askForTourPermission,
        setTourStep,
        skipTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};