import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { toast } from 'react-hot-toast';

interface UserProfile {
  title?: string;
  company?: string;
  location?: string;
  about?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  skills?: string[];
  joinedAt?: Date;
  points?: number;
  assignedRole?: string;
  onboardingCompleted?: boolean;
  completedTours?: Record<string, string>;
}

interface UserSubscription {
  status: 'trial' | 'active' | 'inactive';
  plan?: string;
  eventsQuota: number;
  eventsUsed: number;
  trialStartedAt?: Date;
  trialEndsAt?: Date;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  photoURL?: string;
  profile?: UserProfile;
  subscription: UserSubscription;
  createdAt?: Date;
  updatedAt?: Date;
  stripe_customer_id?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, name: string, isNewUser?: boolean) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (isNewUser?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (userId: string, profileData: Partial<UserProfile>) => Promise<void>;
  startFreeTrial: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signup: async () => {},
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  updateUserProfile: async () => {},
  startFreeTrial: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || userData.email || '',
              name: userData.name || firebaseUser.displayName || '',
              role: userData.role || 'user',
              photoURL: userData.photoURL || firebaseUser.photoURL || undefined,
              profile: userData.profile || {},
              subscription: userData.subscription || {
                status: 'inactive',
                eventsQuota: 0,
                eventsUsed: 0
              },
              createdAt: userData.createdAt?.toDate?.() || undefined,
              updatedAt: userData.updatedAt?.toDate?.() || undefined,
              stripe_customer_id: userData.stripe_customer_id || undefined
            });
          } else {
            // User document doesn't exist, create it
            const newUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || '',
              role: 'user',
              photoURL: firebaseUser.photoURL || undefined,
              profile: {},
              subscription: {
                status: 'inactive',
                eventsQuota: 0,
                eventsUsed: 0
              },
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              email: newUser.email,
              name: newUser.name,
              role: newUser.role,
              photoURL: newUser.photoURL,
              profile: newUser.profile,
              subscription: newUser.subscription,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            
            setUser(newUser);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast.error('Failed to load user data');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string, name: string, isNewUser: boolean = false) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        email,
        name,
        role: 'user',
        profile: {
          completedTours: {},
          onboardingCompleted: false
        },
        subscription: {
          status: 'inactive',
          eventsQuota: 0,
          eventsUsed: 0
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isNewUser: isNewUser // Flag to identify newly registered users
      });
      
      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast.error(error.message || 'Failed to create account');
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully!');
    } catch (error: any) {
      console.error('Error logging in:', error);
      toast.error(error.message || 'Failed to log in');
      throw error;
    }
  };

  const loginWithGoogle = async (isNewUser: boolean = false) => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          role: 'user',
          photoURL: firebaseUser.photoURL,
          profile: {
            completedTours: {},
            onboardingCompleted: false
          },
          subscription: {
            status: 'inactive',
            eventsQuota: 0,
            eventsUsed: 0
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isNewUser: isNewUser // Flag to identify newly registered users
        });
        
        toast.success('Account created successfully!');
      } else {
        toast.success('Logged in successfully!');
      }
    } catch (error: any) {
      console.error('Error logging in with Google:', error);
      toast.error(error.message || 'Failed to log in with Google');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully!');
    } catch (error: any) {
      console.error('Error logging out:', error);
      toast.error(error.message || 'Failed to log out');
      throw error;
    }
  };

  const updateUserProfile = async (userId: string, profileData: Partial<UserProfile>) => {
    try {
      const userRef = doc(db, 'users', userId);
      
      // Prepare update data
      const updateData: any = {
        updatedAt: serverTimestamp()
      };
      
      // Add profile fields to update
      Object.entries(profileData).forEach(([key, value]) => {
        updateData[`profile.${key}`] = value;
      });
      
      // Update name if provided
      if (profileData.name) {
        updateData.name = profileData.name;
      }
      
      await updateDoc(userRef, updateData);
      
      // Update local user state
      if (user && user.id === userId) {
        setUser({
          ...user,
          name: profileData.name || user.name,
          profile: {
            ...user.profile,
            ...profileData
          },
          updatedAt: new Date()
        });
      }
      
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  const startFreeTrial = async () => {
    if (!user) {
      toast.error('You must be logged in to start a free trial');
      return;
    }
    
    try {
      const userRef = doc(db, 'users', user.id);
      
      // Set trial details
      const trialStartDate = new Date();
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7); // 7-day trial
      
      await updateDoc(userRef, {
        'subscription.status': 'trial',
        'subscription.eventsQuota': 2,
        'subscription.eventsUsed': 0,
        'subscription.trialStartedAt': serverTimestamp(),
        'subscription.trialEndsAt': trialEndDate,
        updatedAt: serverTimestamp()
      });
      
      // Update local user state
      setUser({
        ...user,
        subscription: {
          ...user.subscription,
          status: 'trial',
          eventsQuota: 2,
          eventsUsed: 0,
          trialStartedAt: trialStartDate,
          trialEndsAt: trialEndDate
        },
        updatedAt: new Date()
      });
      
      toast.success('Free trial activated successfully!');
    } catch (error: any) {
      console.error('Error starting free trial:', error);
      toast.error(error.message || 'Failed to start free trial');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        loginWithGoogle,
        logout,
        updateUserProfile,
        startFreeTrial
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};