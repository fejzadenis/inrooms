import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-hot-toast';

interface TourContextType {
  isTourOpen: boolean;
  currentTour: string | null;
  tourStep: number;
  openTour: (tourName: string) => void;
  closeTour: () => void;
  completeTour: (tourName: string, userId?: string) => Promise<void>;
  startTour: (tourName: string) => void;
  skipTour: () => void;
  setTourStep: (step: number) => void;
  askForTourPermission: (tourName: string) => Promise<boolean>;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [currentTour, setCurrentTour] = useState<string | null>(null);
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
            const completedTours = userData.profile?.completedTours || {};
            setShownTours(completedTours);
          }
        } catch (error) {
          console.error('Error loading completed tours:', error);
        }
      }
    };

    loadCompletedTours();
  }, [user?.id]);

  const openTour = (tourName: string) => {
    setIsTourOpen(true);
    setCurrentTour(tourName);
    setTourStep(0);
  };

  const closeTour = () => {
    setIsTourOpen(false);
    setCurrentTour(null);
  };

  const completeTour = async (tourName: string, userId?: string) => {
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) return;
    
    try {
      // Update local state
      setShownTours(prev => ({
        ...prev,
        [tourName]: true
      }));
      
      // Update in Firestore
      const userRef = doc(db, 'users', targetUserId);
      await updateDoc(userRef, {
        [`profile.completedTours.${tourName}`]: true
      });
    } catch (error) {
      console.error('Error completing tour:', error);
    }
  };

  const startTour = (tourName: string) => {
    // Check if this tour has already been shown
    if (shownTours[tourName]) {
      return;
    }
    
    openTour(tourName);
  };

  const skipTour = () => {
    if (currentTour && user?.id) {
      completeTour(currentTour);
    }
    closeTour();
  };

  const askForTourPermission = async (tourName: string): Promise<boolean> => {
    // If tour has already been shown, don't ask again
    if (shownTours[tourName]) {
      return false;
    }
    
    // For new users, automatically show the tour without asking
    if (user?.isNewUser) {
      return true;
    }
    
    // For existing users, we could implement a permission dialog here
    // For now, we'll just return true to show the tour
    return true;
  };

  return (
    <TourContext.Provider
      value={{
        isTourOpen,
        currentTour,
        tourStep,
        openTour,
        closeTour,
        completeTour,
        startTour,
        skipTour,
        setTourStep,
        askForTourPermission,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};