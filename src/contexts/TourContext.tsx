import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
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
  const [hasCheckedTours, setHasCheckedTours] = useState(false);

  // Load completed tours from user profile
  useEffect(() => {
    const loadCompletedTours = async () => {      
      if (user?.id && !hasCheckedTours) {
        try {
          setHasCheckedTours(true);
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
  }, [user, hasCheckedTours]);

  const startTour = (tourType: TourType) => {
    // Don't start the tour if it's already been shown
    if (shownTours[tourType]) {
      console.log(`TOUR DEBUG: Not starting ${tourType} tour - already shown`);
      return;
    }
    
    console.log(`TOUR DEBUG: Starting ${tourType} tour`);
    setCurrentTour(tourType);
    setTourStep(0);
    setIsTourOpen(true);
  };

  const closeTour = () => {
    console.log(`TOUR DEBUG: Closing tour ${currentTour}`);
    setIsTourOpen(false);
    setCurrentTour(null);
    setTourStep(0);
  };

  const completeTour = async (tourType: TourType, userId?: string) => {
    // Mark tour as shown locally
    console.log(`TOUR DEBUG: Completing tour ${tourType}`);
    setShownTours(prev => ({
      ...prev,
      [tourType]: true
    }));
    
    // Save to database if we have a user ID
    const id = userId || user?.id;
    if (id) {
      try {
        console.log(`TOUR DEBUG: Saving completed tour ${tourType} for user ${id}`);
        const userRef = doc(db, 'users', id);
        
        // Update the completedTours object and also set isNewUser to false
        const updateData = {
          [`profile.completedTours.${tourType}`]: true
        };
        
        // If this is the main tour, also set isNewUser to false
        if (tourType === 'main') {
          console.log(`TOUR DEBUG: Setting isNewUser to false for user ${id}`);
          updateData.isNewUser = false;
          updateData.updatedAt = serverTimestamp();
        }
        
        await updateDoc(userRef, updateData);
        
      } catch (error) {
        console.error(`TOUR DEBUG: Error saving completed tour ${tourType}:`, error);
        console.error('Error saving completed tour:', error);
      }
    }
  };

  const skipTour = () => {
    if (currentTour) {
      console.log(`TOUR DEBUG: Skipping tour ${currentTour}`);
      completeTour(currentTour);
    }
    closeTour();
  };

  const askForTourPermission = async (tourType: TourType): Promise<boolean> => {
    // Check if this tour has already been shown
    if (shownTours[tourType]) {
      // Tour already shown, don't ask again
      return false;
    }
    
    // For new users, automatically show the main tour without asking
    if (user?.isNewUser && tourType === 'main') {
      // User is new, show main tour
      return true;
    }
    
    // For profile tour, never show automatically
    if (tourType === 'profile') {
      // Profile tour should not appear automatically
      return false;
    }
    
    // For other tours (events, network, solutions), only show if the user is new
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