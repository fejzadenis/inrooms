import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface TourContextType {
  isTourOpen: boolean;
  startTour: (tourName?: string) => void;
  closeTour: () => void;
  currentTour: string | null;
  completeTour: (tourName: string) => Promise<void>;
  tourStep: number;
  setTourStep: (step: number) => void;
  skipTour: () => void;
  shouldShowTour: (tourName: string) => Promise<boolean>;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [currentTour, setCurrentTour] = useState<string | null>(null);
  const [tourStep, setTourStep] = useState(0);
  const { user } = useAuth();
  const location = useLocation();

  // Close tour when route changes
  useEffect(() => {
    if (isTourOpen) {
      setIsTourOpen(false);
    }
  }, [location.pathname]);

  const startTour = (tourName = 'main') => {
    setCurrentTour(tourName);
    setTourStep(0);
    setIsTourOpen(true);
  };

  const closeTour = () => {
    setIsTourOpen(false);
  };

  const skipTour = () => {
    closeTour();
    if (currentTour && user) {
      completeTour(currentTour).catch(error => {
        console.error('Error marking tour as completed:', error);
      });
    }
  };

  const completeTour = async (tourName: string) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.id);
      
      // Get current tours data
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      const completedTours = userData?.profile?.completedTours || {};
      
      // Update with new tour completion
      await updateDoc(userRef, {
        [`profile.completedTours.${tourName}`]: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error completing tour:', error);
      throw error;
    }
  };

  const shouldShowTour = async (tourName: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const userRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const completedTours = userData?.profile?.completedTours || {};
        
        // If the tour is not in completedTours, it should be shown
        return !completedTours[tourName];
      }
      
      return true;
    } catch (error) {
      console.error('Error checking tour status:', error);
      return false;
    }
  };

  return (
    <TourContext.Provider
      value={{
        isTourOpen,
        startTour,
        closeTour,
        currentTour,
        completeTour,
        tourStep,
        setTourStep,
        skipTour,
        shouldShowTour
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