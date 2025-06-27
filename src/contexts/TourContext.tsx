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
  startTour: (tourType: TourType) => void;
  closeTour: () => void;
  completeTour: (tourType: TourType, userId?: string) => Promise<void>;
  skipTour: () => void;
  setTourStep: (step: number) => void;
  askForTourPermission: (tourType: TourType) => Promise<boolean>;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: React.ReactNode }) {
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

  const startTour = (tourType: TourType) => {
    setCurrentTour(tourType);
    setTourStep(0);
    setIsTourOpen(true);
  };

  const closeTour = () => {
    setIsTourOpen(false);
    setCurrentTour(null);
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
      console.error('Error completing tour:', error);
    }
  };

  const skipTour = () => {
    if (currentTour && user?.id) {
      completeTour(currentTour, user.id).catch(console.error);
    }
    closeTour();
  };

  const askForTourPermission = async (tourType: TourType): Promise<boolean> => {
    // If user is not logged in, don't show tour
    if (!user) return false;
    
    // If tour is already completed, don't show it again
    if (completedTours[tourType]) return false;
    
    // For new users, automatically show the tour without asking
    if (user.isNewUser) {
      return true;
    }
    
    // For existing users, ask for permission with a nice UI
    return new Promise((resolve) => {
      let isResolved = false;
      
      // Create a custom toast with buttons
      const toastId = toast(
        (t) => (
          <div className="flex flex-col space-y-2">
            <div className="font-medium">Would you like a quick tour?</div>
            <p className="text-sm text-gray-600">
              Learn how to use this section of the platform
            </p>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => {
                  if (!isResolved) {
                    isResolved = true;
                    toast.dismiss(t.id);
                    resolve(true);
                  }
                }}
                className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
              >
                Yes, show me
              </button>
              <button
                onClick={() => {
                  if (!isResolved) {
                    isResolved = true;
                    toast.dismiss(t.id);
                    resolve(false);
                  }
                }}
                className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300"
              >
                Skip
              </button>
            </div>
          </div>
        ),
        {
          duration: 10000, // 10 seconds
          position: 'bottom-center',
          style: {
            borderRadius: '10px',
            background: '#fff',
            color: '#333',
            padding: '16px',
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
          },
        }
      );

      // If the toast expires, consider it as "no"
      setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          toast.dismiss(toastId);
          resolve(false);
        }
      }, 10000);
    });
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
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}