import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role?: string;
  photoURL?: string;
  profile?: {
    title?: string;
    company?: string;
    location?: string;
    about?: string;
    skills?: string[];
    onboardingCompleted?: boolean;
  };
  subscription?: {
    status: 'trial' | 'active' | 'inactive';
    plan?: string;
    eventsQuota?: number;
    eventsUsed?: number;
  };
  connections?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userProfile: UserProfile = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: userData.name || firebaseUser.displayName || '',
              role: userData.role || 'user',
              photoURL: userData.photoURL || firebaseUser.photoURL || '',
              profile: userData.profile || {},
              subscription: userData.subscription || {
                status: 'trial',
                eventsQuota: 3,
                eventsUsed: 0
              },
              connections: userData.connections || [],
              createdAt: userData.createdAt?.toDate(),
              updatedAt: userData.updatedAt?.toDate()
            };
            setUser(userProfile);
          } else {
            // Create user document if it doesn't exist
            const newUserProfile: UserProfile = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || '',
              role: 'user',
              photoURL: firebaseUser.photoURL || '',
              profile: {
                onboardingCompleted: false
              },
              subscription: {
                status: 'trial',
                eventsQuota: 3,
                eventsUsed: 0
              },
              connections: [],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            await setDoc(doc(db, 'users', firebaseUser.uid), {
              ...newUserProfile,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });

            setUser(newUserProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          toast.error('Error loading user profile');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user data to check onboarding status
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      const userData = userDoc.data();
      
      toast.success('Successfully signed in!');
      
      // Redirect based on onboarding status and role
      if (userData?.role === 'admin') {
        navigate('/admin');
      } else if (!userData?.profile?.onboardingCompleted) {
        navigate('/onboarding');
      } else {
        navigate('/events'); // Redirect to events page instead of home
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      const userProfile = {
        id: result.user.uid,
        email: result.user.email || '',
        name: name,
        role: 'user',
        photoURL: '',
        profile: {
          onboardingCompleted: false
        },
        subscription: {
          status: 'trial',
          eventsQuota: 3,
          eventsUsed: 0
        },
        connections: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', result.user.uid), userProfile);
      
      toast.success('Account created successfully!');
      navigate('/onboarding'); // Always go to onboarding for new users
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to create account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        // Create new user profile
        const userProfile = {
          id: result.user.uid,
          email: result.user.email || '',
          name: result.user.displayName || '',
          role: 'user',
          photoURL: result.user.photoURL || '',
          profile: {
            onboardingCompleted: false
          },
          subscription: {
            status: 'trial',
            eventsQuota: 3,
            eventsUsed: 0
          },
          connections: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await setDoc(doc(db, 'users', result.user.uid), userProfile);
        toast.success('Account created successfully!');
        navigate('/onboarding');
      } else {
        const userData = userDoc.data();
        toast.success('Successfully signed in!');
        
        // Redirect based on onboarding status and role
        if (userData?.role === 'admin') {
          navigate('/admin');
        } else if (!userData?.profile?.onboardingCompleted) {
          navigate('/onboarding');
        } else {
          navigate('/events'); // Redirect to events page instead of home
        }
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      toast.success('Successfully signed out');
      navigate('/'); // Go to home page after logout
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Failed to sign out');
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.id);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await setDoc(userRef, updateData, { merge: true });
      
      // Update local state
      setUser(prev => prev ? { ...prev, ...updates } : null);
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}