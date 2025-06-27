import React, { createContext, useContext, useState, useCallback } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

type TourType = 'main' | 'events' | 'network' | 'solutions' | 'profile' | null;

interface TourContextType {
  isTourOpen: boolean;
  currentTour: TourType;
  tourStep: number;
  openTour: (tourType: TourType) => void;
  closeTour: () => void;
  startTour: (tourType: TourType) => void;
  completeTour: (tourType: TourType, userId?: string) => Promise<void>;
  askForTourPermission: (tourType: TourType) => Promise<boolean>;
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

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [currentTour, setCurrentTour] = useState<TourType>(null);
  const [tourStep, setTourStep] = useState(0);

  const openTour = useCallback((tourType: TourType) => {
    setCurrentTour(tourType);
    setIsTourOpen(true);
    setTourStep(0);
  }, []);

  const closeTour = useCallback(() => {
    setIsTourOpen(false);
    setCurrentTour(null);
  }, []);

  const startTour = useCallback((tourType: TourType) => {
    openTour(tourType);
  }, [openTour]);

  const skipTour = useCallback(() => {
    if (currentTour && user) {
      completeTour(currentTour, user.id).catch(console.error);
    }
    closeTour();
  }, [closeTour, currentTour, user]);

  const completeTour = useCallback(async (tourType: TourType, userId?: string) => {
    const uid = userId || user?.id;
    if (!uid) return;

    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // Update the user's completed tours
        await updateDoc(userRef, {
          [`profile.completedTours.${tourType}`]: true,
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error(`Error completing tour ${tourType}:`, error);
    }
  }, [user]);

  const askForTourPermission = useCallback(async (tourType: TourType): Promise<boolean> => {
    if (!user) return false;

    try {
      // Check if user has already completed this tour
      const userRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const completedTours = userData.profile?.completedTours || {};
        
        // If tour is already completed, don't show it again
        if (completedTours[tourType]) {
          return false;
        }
        
        // For new users, automatically start the tour
        if (userData.isNewUser) {
          return true;
        }
      }
      
      // For returning users who haven't completed the tour, ask permission
      return new Promise((resolve) => {
        // Use toast for permission
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
                      We can show you around the key features of inRooms.
                    </p>
                    <div className="mt-4 flex">
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
                        className="ml-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
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
    } catch (error) {
      console.error('Error checking tour status:', error);
      return false;
    }
  }, [user]);

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