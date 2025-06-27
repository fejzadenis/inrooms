import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-hot-toast';

type TourType = 'main' | 'events' | 'network' | 'profile' | 'solutions';

interface TourContextType {
  isTourOpen: boolean;
  currentTour: TourType | null;
  tourStep: number;
  openTour: (tourType: TourType) => void;
  closeTour: () => void;
  startTour: (tourType: TourType) => void;
  completeTour: (tourType: TourType, userId?: string) => Promise<void>;
  skipTour: () => void;
  setTourStep: (step: number) => void;
  askForTourPermission: (tourType: TourType) => Promise<boolean>;
}

const TourContext = createContext<TourContextType>({
  isTourOpen: false,
  currentTour: null,
  tourStep: 0,
  openTour: () => {},
  closeTour: () => {},
  startTour: () => {},
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
  const [completedTours, setCompletedTours] = useState<Record<string, boolean>>({});

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
              setCompletedTours(userData.profile.completedTours);
            }
          }
        } catch (error) {
          console.error('Error loading completed tours:', error);
        }
      }
    };

    loadCompletedTours();
  }, [user]);

  const openTour = (tourType: TourType) => {
    setCurrentTour(tourType);
    setTourStep(0);
    setIsTourOpen(true);
  };

  const closeTour = () => {
    setIsTourOpen(false);
  };

  const startTour = (tourType: TourType) => {
    openTour(tourType);
  };

  const completeTour = async (tourType: TourType, userId?: string) => {
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) return;
    
    try {
      // Update local state
      setCompletedTours(prev => ({
        ...prev,
        [tourType]: true
      }));
      
      // Update in Firestore
      const userRef = doc(db, 'users', targetUserId);
      await updateDoc(userRef, {
        [`profile.completedTours.${tourType}`]: true
      });
    } catch (error) {
      console.error(`Error completing ${tourType} tour:`, error);
    }
  };

  const skipTour = () => {
    if (currentTour && user) {
      completeTour(currentTour).catch(console.error);
    }
    closeTour();
  };

  const askForTourPermission = async (tourType: TourType): Promise<boolean> => {
    // If user is not logged in, don't show tour
    if (!user) return false;
    
    // Check if this tour has already been completed
    if (completedTours[tourType]) return false;
    
    // For newly registered users, automatically show the tour without asking
    if (user.isNewUser) {
      return true;
    }
    
    // For existing users, ask for permission
    try {
      // Check if we've already asked about this tour
      const tourAskedKey = `tourAsked_${tourType}`;
      const hasAskedBefore = localStorage.getItem(tourAskedKey);
      
      if (hasAskedBefore) return false;
      
      // Ask user if they want to see the tour
      const userWantsTour = window.confirm(
        `Would you like to see a quick tour of the ${tourType} features?`
      );
      
      // Remember that we've asked
      localStorage.setItem(tourAskedKey, 'true');
      
      return userWantsTour;
    } catch (error) {
      console.error('Error asking for tour permission:', error);
      return false;
    }
  };

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
        skipTour,
        setTourStep,
        askForTourPermission,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};