import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { toast } from 'react-hot-toast';

interface UserProfile {
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
    joinedAt?: Date;
  };
  connections?: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  startFreeTrial: () => Promise<void>;
  updateUserProfile: (userId: string, profileData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_EMAIL = 'admin@inrooms.com';

async function createOrUpdateUserProfile(firebaseUser: FirebaseUser, name?: string): Promise<UserProfile> {
  try {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);
    
    const isAdmin = firebaseUser.email === ADMIN_EMAIL;
    const existingData = userDoc.exists() ? userDoc.data() : {};
    
    const userData = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: name || firebaseUser.displayName || existingData.name || '',
      role: isAdmin ? 'admin' : 'user',
      photoURL: firebaseUser.photoURL || existingData.photoURL || null,
      subscription: {
        status: isAdmin ? 'active' : (existingData.subscription?.status || 'inactive'),
        trialEndsAt: existingData.subscription?.trialEndsAt ?? null,
        eventsQuota: isAdmin ? 999999 : (existingData.subscription?.eventsQuota || 0),
        eventsUsed: existingData.subscription?.eventsUsed || 0,
      },
      profile: {
        title: existingData.profile?.title || '',
        company: existingData.profile?.company || '',
        location: existingData.profile?.location || '',
        about: existingData.profile?.about || '',
        phone: existingData.profile?.phone || '',
        website: existingData.profile?.website || '',
        linkedin: existingData.profile?.linkedin || '',
        skills: existingData.profile?.skills || [],
        points: existingData.profile?.points || 0,
        joinedAt: existingData.profile?.joinedAt || new Date(),
      },
      connections: existingData.connections || [],
      createdAt: existingData.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, userData, { merge: true });

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role as 'user' | 'admin',
      photoURL: userData.photoURL,
      subscription: userData.subscription,
      profile: {
        ...userData.profile,
        joinedAt: userData.profile.joinedAt instanceof Date ? userData.profile.joinedAt : new Date(),
      },
      connections: userData.connections,
    };
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    throw error;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userProfile = await createOrUpdateUserProfile(firebaseUser);
          setUser(userProfile);
          
          // Set up real-time listener for user data changes
          const userRef = doc(db, 'users', firebaseUser.uid);
          const unsubscribeUser = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
              const userData = doc.data();
              setUser({
                id: userData.id,
                email: userData.email,
                name: userData.name,
                role: userData.role,
                photoURL: userData.photoURL,
                subscription: userData.subscription,
                profile: {
                  ...userData.profile,
                  joinedAt: userData.profile?.joinedAt?.toDate?.() || userData.profile?.joinedAt || new Date(),
                },
                connections: userData.connections || [],
              });
            }
          });
          
          // Store the unsubscribe function to clean up later
          (window as any).unsubscribeUser = unsubscribeUser;
        } catch (error) {
          console.error('Error handling auth state change:', error);
          toast.error('Error loading user data');
        }
      } else {
        setUser(null);
        // Clean up user data listener
        if ((window as any).unsubscribeUser) {
          (window as any).unsubscribeUser();
          (window as any).unsubscribeUser = null;
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if ((window as any).unsubscribeUser) {
        (window as any).unsubscribeUser();
        (window as any).unsubscribeUser = null;
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userProfile = await createOrUpdateUserProfile(result.user);
      setUser(userProfile);
      toast.success(`Welcome back${userProfile.role === 'admin' ? ', Admin' : ''}!`);
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.message || 'Login failed. Please try again.');
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userProfile = await createOrUpdateUserProfile(result.user);
      setUser(userProfile);
      toast.success(`Welcome${userProfile.role === 'admin' ? ', Admin' : ''}!`);
    } catch (error: any) {
      console.error('Google login failed:', error);
      toast.error('Google sign-in failed. Please try again.');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      toast.success('Successfully logged out');
    } catch (error: any) {
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
      const userProfile = await createOrUpdateUserProfile(result.user, name);
      setUser(userProfile);
      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error('Signup failed:', error);
      toast.error(error.message || 'Failed to create account. Please try again.');
      throw error;
    }
  };

  const startFreeTrial = async () => {
    if (!user) throw new Error('User must be logged in to start trial');

    try {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);

      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        'subscription.status': 'trial',
        'subscription.trialEndsAt': trialEndsAt,
        'subscription.eventsQuota': 2,
        'subscription.eventsUsed': 0,
        updatedAt: serverTimestamp(),
      });

      toast.success('Free trial activated successfully!');
    } catch (error: any) {
      console.error('Failed to start trial:', error);
      toast.error('Failed to activate free trial. Please try again.');
      throw error;
    }
  };

  const updateUserProfile = async (userId: string, profileData: any) => {
    try {
      const userRef = doc(db, 'users', userId);
      
      // Prepare the update data
      const updateData = {
        name: profileData.name,
        'profile.title': profileData.title || '',
        'profile.company': profileData.company || '',
        'profile.location': profileData.location || '',
        'profile.about': profileData.about || '',
        'profile.phone': profileData.phone || '',
        'profile.website': profileData.website || '',
        'profile.linkedin': profileData.linkedin || '',
        'profile.skills': profileData.skills || [],
        updatedAt: serverTimestamp(),
      };

      await updateDoc(userRef, updateData);
      
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      toast.error('Failed to update profile. Please try again.');
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
      startFreeTrial,
      updateUserProfile
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