import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  photoURL?: string;
  subscription: {
    status: 'trial' | 'active' | 'inactive';
    trialEndsAt?: Date;
    eventsQuota: number;
    eventsUsed: number;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  startFreeTrial: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_EMAIL = 'admin@inrooms.com';
const ADMIN_PASSWORD = 'Admin123!';
const ADMIN_NAME = 'Admin';

async function createOrUpdateUser(firebaseUser: FirebaseUser, name?: string): Promise<User> {
  try {
    await firebaseUser.getIdToken(true);
    
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    
    let userData: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: name || firebaseUser.displayName || '',
      role: firebaseUser.email === ADMIN_EMAIL ? 'admin' : 'user',
      subscription: {
        status: 'inactive',
        eventsQuota: 0,
        eventsUsed: 0
      }
    };

    // Only include photoURL if it exists and is not null/empty
    if (firebaseUser.photoURL) {
      userData.photoURL = firebaseUser.photoURL;
    }

    if (!userSnap.exists()) {
      if (firebaseUser.email === ADMIN_EMAIL) {
        userData.subscription.status = 'active';
        userData.subscription.eventsQuota = Infinity;
        userData.name = ADMIN_NAME;
      }
      await setDoc(userRef, userData);
    } else {
      const existingData = userSnap.data() as User;
      userData = { ...existingData, ...userData };
      await setDoc(userRef, userData, { merge: true });
    }

    return userData;
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
}

async function ensureAdminExists() {
  try {
    const adminCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    await createOrUpdateUser(adminCredential.user);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      try {
        const adminCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        await updateProfile(adminCredential.user, { displayName: ADMIN_NAME });
        await createOrUpdateUser(adminCredential.user, ADMIN_NAME);
      } catch (createError: any) {
        if (createError.code === 'auth/email-already-in-use') {
          console.log('Admin user already exists');
          return;
        }
        console.error('Error creating admin account:', createError);
        throw createError;
      }
    } else if (error.code === 'auth/invalid-credential') {
      console.log('Admin exists but credentials are incorrect');
      return;
    } else {
      console.error('Error checking admin account:', error);
      throw error;
    }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureAdminExists().catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userData = await createOrUpdateUser(firebaseUser);
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
        toast.error('Error loading user data');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userData = await createOrUpdateUser(result.user);
      setUser(userData);
      toast.success(`Welcome back${userData.role === 'admin' ? ', Admin' : ''}!`);
    } catch (error: any) {
      console.error('Email/password login failed:', error);
      if (error.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password');
      } else {
        toast.error('Login failed. Please try again.');
      }
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      const userData = await createOrUpdateUser(result.user);
      setUser(userData);
      toast.success(`Welcome${userData.role === 'admin' ? ', Admin' : ''}!`);
    } catch (error: any) {
      console.error('Google login failed:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in was cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Popup was blocked. Please allow popups for this site in your browser settings and try again.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        // User cancelled or multiple popups were triggered
        toast.error('Sign-in was cancelled. Please try again.');
      } else {
        toast.error('Google sign-in failed. Please try again.');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    if (email === ADMIN_EMAIL) {
      toast.error('This email is reserved. Please use a different email.');
      throw new Error('Reserved email address');
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      const userData = await createOrUpdateUser(result.user, name);
      setUser(userData);
      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error('Signup failed:', error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          toast.error('This email is already registered. Please try logging in instead.');
          break;
        case 'auth/weak-password':
          toast.error('Password is too weak. Please use a stronger password.');
          break;
        case 'auth/invalid-email':
          toast.error('Invalid email address. Please check and try again.');
          break;
        case 'auth/network-request-failed':
          toast.error('Network error. Please check your connection and try again.');
          break;
        default:
          toast.error('Failed to create account. Please try again.');
      }
      throw error;
    }
  };

  const startFreeTrial = async () => {
    if (!user) throw new Error('User must be logged in to start trial');

    try {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);

      const updatedUser: User = {
        ...user,
        subscription: {
          status: 'trial',
          trialEndsAt,
          eventsQuota: 2,
          eventsUsed: 0
        }
      };

      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, updatedUser, { merge: true });
      setUser(updatedUser);
      toast.success('Free trial activated successfully!');
    } catch (error) {
      console.error('Failed to start trial:', error);
      toast.error('Failed to activate free trial. Please try again.');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login,
      loginWithGoogle,
      logout, 
      signup,
      startFreeTrial 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}