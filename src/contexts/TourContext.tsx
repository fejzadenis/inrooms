import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-hot-toast';

type TourType = 'main' | 'events' | 'network' | 'profile' | 'solutions';

interface TourContextType {
  isTourOpen: boolean;
  currentTour: TourType | null;
  tourStep: number;
  startTour: (tourType: TourType) => void;
  closeTour: () => void;
  completeTour: (tourType: TourType) => Promise<void>;
  askForTourPermission: (tourType: TourType) => Promise<boolean>;
  setTourStep: (step: number) => void;
  skipTour: () => void;
}

const TourContext = createContext<TourContextType>({
  isTourOpen: false,
  currentTour: null,
  tourStep: 0,
  startTour: () => {},
  closeTour: () => {},
  completeTour: async () => {},
  askForTourPermission: async () => false,
  setTourStep: () => {},
  skipTour: () => {},
});

export const useTour = () => useContext(TourContext);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [currentTour, setCurrentTour] = useState<TourType | null>(null);
  const [tourStep, setTourStep] = useState(0);
  const [hasAskedForPermission, setHasAskedForPermission] = useState(false);

  // Check if a tour has been completed
  const hasTourBeenCompleted = useCallback(async (userId: string, tourType: TourType): Promise<boolean> => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return !!(userData.profile?.completedTours?.[tourType]);
      }
      return false;
    } catch (error) {
      console.error('Error checking tour completion status:', error);
      return false;
    }
  }, []);

  // Mark a tour as completed
  const completeTour = useCallback(async (tourType: TourType): Promise<void> => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`profile.completedTours.${tourType}`]: true
      });
    } catch (error) {
      console.error('Error marking tour as completed:', error);
    }
  }, [user]);

  // Ask for permission to start the tour
  const askForTourPermission = useCallback(async (tourType: TourType): Promise<boolean> => {
    if (!user) return false;
    
    // Only ask once per session
    if (hasAskedForPermission) return false;
    
    // Check if this tour has already been completed
    const isCompleted = await hasTourBeenCompleted(user.id, tourType);
    if (isCompleted) return false;
    
    // Only ask for the main tour
    if (tourType !== 'main') return false;
    
    // Mark that we've asked for permission
    setHasAskedForPermission(true);
    
    // Show toast with permission request
    return new Promise((resolve) => {
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
                    We can show you around the platform to help you get started.
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
        { duration: 10000 }
      );
    });
  }, [user, hasAskedForPermission, hasTourBeenCompleted]);

  // Start a tour
  const startTour = useCallback((tourType: TourType) => {
    setCurrentTour(tourType);
    setTourStep(0);
    setIsTourOpen(true);
  }, []);

  // Close the tour
  const closeTour = useCallback(() => {
    setIsTourOpen(false);
    setCurrentTour(null);
    setTourStep(0);
  }, []);

  // Skip the tour
  const skipTour = useCallback(() => {
    if (currentTour) {
      completeTour(currentTour).catch(console.error);
    }
    closeTour();
  }, [currentTour, completeTour, closeTour]);

  return (
    <TourContext.Provider
      value={{
        isTourOpen,
        currentTour,
        tourStep,
        startTour,
        closeTour,
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