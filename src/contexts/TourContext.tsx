import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-hot-toast';

type TourType = 'main' | 'events' | 'network' | 'profile' | 'solutions';

interface TourContextType {
  isTourOpen: boolean;
  currentTour: TourType | null;
  tourStep: number;
  startTour: (tourType: TourType) => void;
  closeTour: () => void;
  completeTour: (tourType: TourType, userId?: string) => Promise<void>;
  skipTour: () => void;
  setTourStep: (step: number) => void;
  askForTourPermission: (tourType: TourType) => Promise<boolean>;
}

const TourContext = createContext<TourContextType>({
  isTourOpen: false,
  currentTour: null,
  tourStep: 0,
  startTour: () => {},
  closeTour: () => {},
  completeTour: async () => {},
  skipTour: () => {},
  setTourStep: () => {},
  askForTourPermission: async () => false,
});

export const useTour = () => useContext(TourContext);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [currentTour, setCurrentTour] = useState<TourType | null>(null);
  const [tourStep, setTourStep] = useState(0);
  const [shownTours, setShownTours] = useState<Record<string, boolean>>({});

  // Load completed tours from user profile
  useEffect(() => {
    const loadCompletedTours = async () => {
      if (user?.id) {
        try {
          const userRef = doc(db, 'users', user.id);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.profile?.completedTours) {
              setShownTours(userData.profile.completedTours);
            }
          }
        } catch (error) {
          console.error('Error loading completed tours:', error);
        }
      }
    };

    loadCompletedTours();
  }, [user]);

  const startTour = (tourType: TourType) => {
    // Don't start the tour if it's already been shown
    if (shownTours[tourType]) {
      return;
    }
    
    setCurrentTour(tourType);
    setTourStep(0);
    setIsTourOpen(true);
  };

  const closeTour = () => {
    setIsTourOpen(false);
    setCurrentTour(null);
    setTourStep(0);
  };

  const completeTour = async (tourType: TourType, userId?: string) => {
    // Mark tour as shown locally
    setShownTours(prev => ({
      ...prev,
      [tourType]: true
    }));
    
    // Save to database if we have a user ID
    const id = userId || user?.id;
    if (id) {
      try {
        const userRef = doc(db, 'users', id);
        await updateDoc(userRef, {
          [`profile.completedTours.${tourType}`]: true
        });
      } catch (error) {
        console.error('Error saving completed tour:', error);
      }
    }
  };

  const skipTour = () => {
    if (currentTour) {
      completeTour(currentTour);
    }
    closeTour();
  };

  const askForTourPermission = async (tourType: TourType): Promise<boolean> => {
    // Check if this tour has already been shown
    if (shownTours[tourType]) {
      return false;
    }
    
    // For new users, automatically show the main tour without asking
    if (user?.isNewUser && tourType === 'main') {
      return true;
    }
    
    // For other tours, only show if the user is new and hasn't seen this tour yet
    return user?.isNewUser || false;
  };

  return (
    <TourContext.Provider
      value={{
        isTourOpen,
        currentTour,
        tourStep,
        startTour,
        closeTour,
        completeTour,
        skipTour,
        setTourStep,
        askForTourPermission,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};