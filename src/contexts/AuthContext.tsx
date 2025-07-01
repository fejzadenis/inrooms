import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification as firebaseSendEmailVerification,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  User as FirebaseUser,
  getAuth
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
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
  photoURL?: string | null;
  joinedAt?: Date;
  points?: number;
  assignedRole?: string;
}

interface UserSubscription {
  status: 'trial' | 'active' | 'inactive';
  eventsQuota: number;
  eventsUsed: number;
  trialEndsAt?: Date;
}

interface User {
  id: string;
  uid?: string; // For backward compatibility
  name: string;
  email: string;
  role: 'user' | 'admin';
  photoURL?: string;
  profile?: UserProfile;
  subscription: UserSubscription;
  connections?: string[];
  stripe_customer_id?: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, name: string, isNewUser?: boolean) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (isNewUser?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  startFreeTrial: () => Promise<void>;
  updateUserProfile: (userId: string, profileData: Partial<UserProfile & { name?: string }>) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            // User exists in Firestore, update with latest auth data
            const userData = userDoc.data();
            
            const userProfile: User = {
              id: firebaseUser.uid,
              uid: firebaseUser.uid, // For backward compatibility
              name: userData.name || firebaseUser.displayName || '',
              email: userData.email || firebaseUser.email || '',
              role: userData.role || 'user',
              photoURL: userData.photoURL || firebaseUser.photoURL || undefined,
              profile: userData.profile || {},
              subscription: userData.subscription || {
                status: 'inactive',
                eventsQuota: 0,
                eventsUsed: 0
              },
              connections: userData.connections || [],
              stripe_customer_id: userData.stripe_customer_id,
              emailVerified: firebaseUser.emailVerified
            };
            
            setUser(userProfile);
          } else {
            // User doesn't exist in Firestore yet, create a new document
            const newUser: User = {
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              role: 'user',
              photoURL: firebaseUser.photoURL || undefined,
              profile: {
                joinedAt: new Date(),
                points: 0
              },
              subscription: {
                status: 'inactive',
                eventsQuota: 0,
                eventsUsed: 0
              },
              connections: [],
              emailVerified: firebaseUser.emailVerified
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              ...newUser,
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

  const signup = async (email: string, password: string, name: string, isNewUser = true) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update display name
      await firebaseUpdateProfile(firebaseUser, { displayName: name });
      
      // Send email verification
      await firebaseSendEmailVerification(firebaseUser);
      
      // Create user document in Firestore
      const newUser: User = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        name: name,
        email: firebaseUser.email || '',
        role: 'user',
        photoURL: firebaseUser.photoURL || undefined,
        profile: {
          joinedAt: new Date(),
          points: 0
        },
        subscription: {
          status: 'inactive',
          eventsQuota: 0,
          eventsUsed: 0
        },
        connections: [],
        emailVerified: firebaseUser.emailVerified
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...newUser,
        isNewUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setUser(newUser);
      toast.success('Account created! Please verify your email.');
    } catch (error: any) {
      console.error('Error signing up:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already in use. Please use a different email or try logging in.');
      } else {
        toast.error(error.message || 'Failed to create account');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully!');
    } catch (error: any) {
      console.error('Error logging in:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        toast.error('Invalid email or password');
      } else {
        toast.error(error.message || 'Failed to log in');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (isNewUser = false) => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // Create new user document
        const newUser: User = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          role: 'user',
          photoURL: firebaseUser.photoURL || undefined,
          profile: {
            joinedAt: new Date(),
            points: 0
          },
          subscription: {
            status: 'inactive',
            eventsQuota: 0,
            eventsUsed: 0
          },
          connections: [],
          emailVerified: firebaseUser.emailVerified
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...newUser,
          isNewUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        setUser(newUser);
      }
      
      toast.success('Logged in successfully!');
    } catch (error: any) {
      console.error('Error logging in with Google:', error);
      toast.error(error.message || 'Failed to log in with Google');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error: any) {
      console.error('Error logging out:', error);
      toast.error(error.message || 'Failed to log out');
      throw error;
    }
  };

  const startFreeTrial = async () => {
    if (!user) {
      toast.error('You must be logged in to start a free trial');
      return;
    }

    try {
      setLoading(true);
      
      // Set trial end date (7 days from now)
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);
      
      // Update user document with trial information
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        'subscription.status': 'trial',
        'subscription.eventsQuota': 2,
        'subscription.eventsUsed': 0,
        'subscription.trialEndsAt': trialEndsAt,
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
          trialEndsAt
        }
      });
      
      toast.success('Free trial activated! You now have 2 event credits.');
    } catch (error: any) {
      console.error('Error starting free trial:', error);
      toast.error(error.message || 'Failed to start free trial');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (userId: string, profileData: Partial<UserProfile & { name?: string }>) => {
    if (!user) {
      toast.error('You must be logged in to update your profile');
      return;
    }

    try {
      setLoading(true);
      
      const updateData: Record<string, any> = {
        updatedAt: serverTimestamp()
      };
      
      // Handle name separately as it's at the root level
      if (profileData.name) {
        updateData.name = profileData.name;
        
        // Also update Firebase Auth display name if this is the current user
        if (userId === user.id) {
          const currentUser = getAuth().currentUser;
          if (currentUser) {
            await firebaseUpdateProfile(currentUser, { displayName: profileData.name });
          }
        }
      }
      
      // Handle photoURL separately as it can be at the root level
      if (profileData.photoURL !== undefined) {
        updateData.photoURL = profileData.photoURL;
        
        // Also update Firebase Auth photo URL if this is the current user
        if (userId === user.id) {
          const currentUser = getAuth().currentUser;
          if (currentUser) {
            await firebaseUpdateProfile(currentUser, { photoURL: profileData.photoURL || null });
          }
        }
      }
      
      // Add all other profile fields with proper nesting
      Object.entries(profileData).forEach(([key, value]) => {
        if (key !== 'name' && key !== 'photoURL') {
          updateData[`profile.${key}`] = value;
        }
      });
      
      // Update Firestore document
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, updateData);
      
      // Update local state if this is the current user
      if (userId === user.id) {
        const updatedUser = { ...user };
        
        // Update name if provided
        if (profileData.name) {
          updatedUser.name = profileData.name;
        }
        
        // Update photoURL if provided
        if (profileData.photoURL !== undefined) {
          updatedUser.photoURL = profileData.photoURL;
        }
        
        // Update profile fields
        updatedUser.profile = {
          ...updatedUser.profile,
          ...Object.fromEntries(
            Object.entries(profileData).filter(([key]) => key !== 'name' && key !== 'photoURL')
          )
        };
        
        setUser(updatedUser);
      }
      
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendEmailVerification = async () => {
    try {
      const currentUser = getAuth().currentUser;
      if (!currentUser) {
        throw new Error('No user is currently signed in');
      }
      
      await firebaseSendEmailVerification(currentUser);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      toast.error(error.message || 'Failed to send verification email');
      throw error;
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      toast.error(error.message || 'Failed to send password reset email');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    startFreeTrial,
    updateUserProfile,
    sendEmailVerification,
    sendPasswordReset
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}