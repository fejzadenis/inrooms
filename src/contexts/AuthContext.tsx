import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
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
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
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
  onboardingCompletedAt?: string;
  completedTours?: Record<string, boolean>;
  [key: string]: any; // Allow additional properties
}

interface UserSubscription {
  status: 'trial' | 'active' | 'inactive';
  eventsQuota: number;
  eventsUsed: number;
  trialEndsAt?: Date;
  plan?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  photoURL?: string;
  profile?: UserProfile;
  subscription: UserSubscription;
  stripe_customer_id?: string;
  isNewUser?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
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
  error: null,
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
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Convert Firestore timestamps to Date objects
            const subscription: UserSubscription = {
              status: userData.subscription?.status || 'inactive',
              eventsQuota: userData.subscription?.eventsQuota || 0,
              eventsUsed: userData.subscription?.eventsUsed || 0,
              trialEndsAt: userData.subscription?.trialEndsAt?.toDate?.() || undefined,
              plan: userData.subscription?.plan || undefined
            };
            
            const profile: UserProfile | undefined = userData.profile ? {
              ...userData.profile,
              joinedAt: userData.profile.joinedAt?.toDate?.() || undefined,
            } : undefined;
            
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || userData.email || '',
              name: userData.name || firebaseUser.displayName || '',
              role: userData.role || 'user',
              photoURL: firebaseUser.photoURL || userData.photoURL || undefined,
              profile,
              subscription,
              stripe_customer_id: userData.stripe_customer_id,
              isNewUser: userData.isNewUser || false
            });
          } else {
            // User document doesn't exist, create it
            const newUser: Partial<User> = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || '',
              role: 'user',
              photoURL: firebaseUser.photoURL || undefined,
              subscription: {
                status: 'inactive',
                eventsQuota: 0,
                eventsUsed: 0
              },
              isNewUser: true
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              ...newUser,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            
            setUser(newUser as User);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Failed to load user data');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const signup = async (email: string, password: string, name: string, isNewUser: boolean = true) => {
    setLoading(true);
    setError(null);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        id: firebaseUser.uid,
        email: email,
        name: name,
        role: 'user',
        photoURL: firebaseUser.photoURL || null,
        subscription: {
          status: 'inactive',
          eventsQuota: 0,
          eventsUsed: 0
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isNewUser: isNewUser
      });
      
      // Update user state
      setUser({
        id: firebaseUser.uid,
        email: email,
        name: name,
        role: 'user',
        photoURL: firebaseUser.photoURL || undefined,
        subscription: {
          status: 'inactive',
          eventsQuota: 0,
          eventsUsed: 0
        },
        isNewUser: isNewUser
      });
      
      toast.success('Account created successfully!');
    } catch (err) {
      console.error('Signup error:', err);
      if (err instanceof Error) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError('An unknown error occurred');
        toast.error('Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully!');
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof Error) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError('An unknown error occurred');
        toast.error('Failed to log in');
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (isNewUser: boolean = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // Create user document in Firestore
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          role: 'user',
          photoURL: firebaseUser.photoURL,
          subscription: {
            status: 'inactive',
            eventsQuota: 0,
            eventsUsed: 0
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isNewUser: isNewUser
        });
        
        toast.success('Account created successfully!');
      } else {
        toast.success('Logged in successfully!');
      }
    } catch (err) {
      console.error('Google login error:', err);
      if (err instanceof Error) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError('An unknown error occurred');
        toast.error('Failed to log in with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await firebaseSignOut(auth);
      setUser(null);
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
      if (err instanceof Error) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError('An unknown error occurred');
        toast.error('Failed to log out');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (userId: string, profileData: Partial<UserProfile>) => {
    setLoading(true);
    setError(null);
    
    try {
      const userRef = doc(db, 'users', userId);
      
      // Prepare update data
      const updateData: Record<string, any> = {
        updatedAt: serverTimestamp()
      };
      
      // Handle name separately as it's at the root level
      if (profileData.name) {
        updateData.name = profileData.name;
        delete profileData.name;
      }
      
      // Add profile fields with proper nesting
      Object.entries(profileData).forEach(([key, value]) => {
        updateData[`profile.${key}`] = value;
      });
      
      await updateDoc(userRef, updateData);
      
      // Update local user state
      if (user && user.id === userId) {
        setUser(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            name: profileData.name || prev.name,
            profile: {
              ...prev.profile,
              ...profileData
            }
          };
        });
      }
      
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Profile update error:', err);
      if (err instanceof Error) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError('An unknown error occurred');
        toast.error('Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const startFreeTrial = async () => {
    if (!user) {
      throw new Error('User must be logged in to start a trial');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const userRef = doc(db, 'users', user.id);
      
      // Set trial end date to 7 days from now
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7);
      
      // Update user subscription
      await updateDoc(userRef, {
        'subscription.status': 'trial',
        'subscription.eventsQuota': 2,
        'subscription.eventsUsed': 0,
        'subscription.trialEndsAt': Timestamp.fromDate(trialEndDate),
        'subscription.startedAt': serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Update local user state
      setUser(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          subscription: {
            ...prev.subscription,
            status: 'trial',
            eventsQuota: 2,
            eventsUsed: 0,
            trialEndsAt: trialEndDate
          }
        };
      });
      
      toast.success('Free trial activated successfully!');
    } catch (err) {
      console.error('Free trial activation error:', err);
      if (err instanceof Error) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError('An unknown error occurred');
        toast.error('Failed to activate free trial');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
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