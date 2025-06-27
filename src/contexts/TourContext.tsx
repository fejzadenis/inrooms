import React, { createContext, useContext, useState, useCallback } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

type TourType = 'main' | 'events' | 'network' | 'profile' | null;

interface TourContextType {
  isTourOpen: boolean;
  currentTour: TourType;
  tourStep: number;
  startTour: (tourType: TourType) => void;
  closeTour: () => void;
  completeTour: (tourType: TourType) => Promise<void>;
  shouldShowTour: (tourType: TourType) => Promise<boolean>;
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
  shouldShowTour: async () => false,
  skipTour: () => {},
  setTourStep: () => {},
  askForTourPermission: async () => false,
});

export const useTour = () => useContext(TourContext);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [currentTour, setCurrentTour] = useState<TourType>(null);
  const [tourStep, setTourStep] = useState(0);

  // Start a specific tour
  const startTour = useCallback((tourType: TourType) => {
    setCurrentTour(tourType);
    setTourStep(0);
    setIsTourOpen(true);
  }, []);

  // Close the current tour
  const closeTour = useCallback(() => {
    setIsTourOpen(false);
    setCurrentTour(null);
  }, []);

  // Skip the current tour and mark it as completed
  const skipTour = useCallback(async () => {
    if (currentTour && user) {
      await completeTour(currentTour);
    }
    closeTour();
  }, [currentTour, user]);

  // Mark a tour as completed in the user's profile
  const completeTour = useCallback(async (tourType: TourType) => {
    if (!user || !tourType) return;

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        [`profile.completedTours.${tourType}`]: true
      });
    } catch (error) {
      console.error('Error marking tour as completed:', error);
    }
  }, [user]);

  // Check if a tour should be shown (not completed yet)
  const shouldShowTour = useCallback(async (tourType: TourType): Promise<boolean> => {
    if (!user || !tourType) return false;

    try {
      const userRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const completedTours = userData.profile?.completedTours || {};
        return !completedTours[tourType];
      }
      return true;
    } catch (error) {
      console.error('Error checking tour status:', error);
      return false;
    }
  }, [user]);

  // Ask user for permission to show the tour
  const askForTourPermission = useCallback(async (tourType: TourType): Promise<boolean> => {
    if (!user || !tourType) return false;
    
    // Check if the tour has already been completed
    const shouldShow = await shouldShowTour(tourType);
    if (!shouldShow) return false;
    
    // Create a promise that will be resolved when the user makes a choice
    return new Promise((resolve) => {
      // Use toast for a non-intrusive prompt
      toast.custom(
        (t) => (
          <div className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex flex-col`}>
            <div className="p-4">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Would you like a quick tour?
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    We can show you around to help you get started.
                  </p>
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => {
                        toast.dismiss(t.id);
                        resolve(true);
                      }}
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                    >
                      Yes, show me around
                    </button>
                    <button
                      onClick={() => {
                        toast.dismiss(t.id);
                        completeTour(tourType);
                        resolve(false);
                      }}
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                    >
                      No, thanks
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    });
  }, [user, shouldShowTour, completeTour]);

  const value = {
    isTourOpen,
    currentTour,
    tourStep,
    startTour,
    closeTour,
    completeTour,
    shouldShowTour,
    skipTour,
    setTourStep,
    askForTourPermission,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  );
};