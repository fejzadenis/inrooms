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
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  photoURL?: string;
  profile?: {
    title?: string;
    company?: string;
    location?: string;
    about?: string;
    phone?: string;
    website?: string;
    linkedin?: string;
    skills?: string[];
    points?: number;
    assignedRole?: string;
    completedTours?: Record<string, boolean>;
    [key: string]: any;
  };
  subscription: {
    status: 'trial' | 'active' | 'inactive';
    eventsQuota: number;
    eventsUsed: number;
    trialEndsAt?: Date;
  };
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
  updateUserProfile: (userId: string, profileData: any) => Promise<void>;
  startFreeTrial: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await getUserData(firebaseUser);
          setUser(userData);
        } catch (err) {
          console.error('Error getting user data:', err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getUserData = async (firebaseUser: FirebaseUser): Promise<User> => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      
      // Convert Firestore timestamps to Date objects
      const trialEndsAt = userData.subscription?.trialEndsAt?.toDate?.();
      
      return {
        id: firebaseUser.uid,
        name: userData.name || firebaseUser.displayName || '',
        email: userData.email || firebaseUser.email || '',
        role: userData.role || 'user',
        photoURL: userData.photoURL || firebaseUser.photoURL || undefined,
        profile: userData.profile || {},
        subscription: {
          status: userData.subscription?.status || 'inactive',
          eventsQuota: userData.subscription?.eventsQuota || 0,
          eventsUsed: userData.subscription?.eventsUsed || 0,
          trialEndsAt: trialEndsAt || undefined
        },
        stripe_customer_id: userData.stripe_customer_id,
        isNewUser: userData.isNewUser || false
      };
    } else {
      // Create a new user document if it doesn't exist
      const newUser = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        role: 'user',
        photoURL: firebaseUser.photoURL || undefined,
        profile: {},
        subscription: {
          status: 'inactive',
          eventsQuota: 0,
          eventsUsed: 0
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isNewUser: true
      };

      await setDoc(userRef, {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        photoURL: newUser.photoURL,
        profile: newUser.profile,
        subscription: newUser.subscription,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
        isNewUser: true
      });

      return newUser;
    }
  };

  const signup = async (email: string, password: string, name: string, isNewUser: boolean = true) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document
      const userRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        name,
        email,
        role: 'user',
        photoURL: userCredential.user.photoURL,
        profile: {},
        subscription: {
          status: 'inactive',
          eventsQuota: 0,
          eventsUsed: 0
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isNewUser
      });

      toast.success('Account created successfully!');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account');
      toast.error(err.message || 'Failed to create account');
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully!');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to log in');
      toast.error(err.message || 'Failed to log in');
      throw err;
    }
  };

  const loginWithGoogle = async (isNewUser: boolean = false) => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if this is a new user
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // Create user document for new Google sign-ins
        await setDoc(userRef, {
          name: result.user.displayName,
          email: result.user.email,
          role: 'user',
          photoURL: result.user.photoURL,
          profile: {},
          subscription: {
            status: 'inactive',
            eventsQuota: 0,
            eventsUsed: 0
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isNewUser
        });
        toast.success('Account created successfully!');
      } else {
        toast.success('Logged in successfully!');
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Failed to log in with Google');
      toast.error(err.message || 'Failed to log in with Google');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Failed to log out');
      toast.error(err.message || 'Failed to log out');
      throw err;
    }
  };

  const updateUserProfile = async (userId: string, profileData: any) => {
    try {
      const userRef = doc(db, 'users', userId);
      
      // Prepare update data
      const updateData: any = {
        updatedAt: serverTimestamp()
      };
      
      // Handle top-level fields
      if (profileData.name) updateData.name = profileData.name;
      if (profileData.photoURL !== undefined) updateData.photoURL = profileData.photoURL;
      
      // Handle profile fields
      Object.keys(profileData).forEach(key => {
        if (key !== 'name' && key !== 'photoURL') {
          updateData[`profile.${key}`] = profileData[key];
        }
      });
      
      await updateDoc(userRef, updateData);
      
      // Update local user state
      if (user && user.id === userId) {
        setUser(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            name: profileData.name || prev.name,
            photoURL: profileData.photoURL !== undefined ? profileData.photoURL : prev.photoURL,
            profile: {
              ...prev.profile,
              ...Object.fromEntries(
                Object.entries(profileData).filter(([key]) => 
                  key !== 'name' && key !== 'photoURL'
                )
              )
            }
          };
        });
      }
      
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      console.error('Profile update error:', err);
      toast.error(err.message || 'Failed to update profile');
      throw err;
    }
  };

  const startFreeTrial = async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      const userRef = doc(db, 'users', user.id);
      
      // Set trial end date (7 days from now)
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);
      
      await updateDoc(userRef, {
        'subscription.status': 'trial',
        'subscription.eventsQuota': 2,
        'subscription.eventsUsed': 0,
        'subscription.trialEndsAt': trialEndsAt,
        'updatedAt': serverTimestamp()
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
            trialEndsAt
          }
        };
      });
      
      toast.success('Free trial activated successfully!');
    } catch (err: any) {
      console.error('Free trial activation error:', err);
      toast.error(err.message || 'Failed to activate free trial');
      throw err;
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
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}