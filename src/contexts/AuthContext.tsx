import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  sendEmailVerification,
  applyActionCode,
  reload
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { supabase } from '../config/supabase';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  photoURL?: string;
  emailVerified: boolean;
  dbEmailVerified: boolean;
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
    onboardingCompleted?: boolean;
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
  connections?: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signup: (email: string, password: string, name: string, isNewUser?: boolean) => Promise<void>;
  login: (email: string, password: string) => Promise<any>;
  loginWithGoogle: (isNewUser?: boolean) => Promise<any>;
  logout: () => Promise<void>;
  updateUserProfile: (userId: string, profileData: any) => Promise<void>;
  startFreeTrial: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  markEmailVerified: (userId: string) => Promise<void>;
  confirmResetPassword: (code: string, newPassword: string) => Promise<void>;
  sendVerificationEmail: (user: FirebaseUser) => Promise<void>;
  verifyEmail: (actionCode: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Cache for user data to prevent excessive Firestore reads
const userDataCache = new Map<string, { data: User; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Rate limiting for operations
const operationTimestamps = new Map<string, number>();
const RATE_LIMIT_DELAY = 1000; // 1 second between operations

// Helper function to check if operation should be rate limited
const shouldRateLimit = (operation: string): boolean => {
  const now = Date.now();
  const lastOperation = operationTimestamps.get(operation);
  
  if (lastOperation && now - lastOperation < RATE_LIMIT_DELAY) {
    return true;
  }
  
  operationTimestamps.set(operation, now);
  return false;
};

// Helper function to get cached user data
const getCachedUserData = (userId: string): User | null => {
  const cached = userDataCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

// Helper function to cache user data
const setCachedUserData = (userId: string, userData: User): void => {
  userDataCache.set(userId, {
    data: userData,
    timestamp: Date.now()
  });
};

// Helper function to sync user data to Supabase
const syncUserToSupabase = async (userData: User): Promise<void> => {
  try {
    // Rate limit sync operations
    if (shouldRateLimit(`syncUser-${userData.id}`)) {
      console.warn('Rate limited: syncUserToSupabase');
      return;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase configuration missing, skipping user sync');
      return;
    }

    // Validate that the environment variables are not placeholder values
    if (supabaseUrl === 'your_supabase_url' || supabaseAnonKey === 'your_supabase_anon_key') {
      console.warn('Supabase environment variables contain placeholder values, skipping user sync');
      return;
    }
    console.log('Syncing user to Supabase:', userData.id);
    
    const syncData = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      photo_url: userData.photoURL || null,
      avatar_url: userData.photoURL || null,
      email_verified: userData.emailVerified,
      subscription_status: userData.subscription.status,
      subscription_events_quota: userData.subscription.eventsQuota,
      subscription_events_used: userData.subscription.eventsUsed,
      subscription_trial_ends_at: userData.subscription.trialEndsAt?.toISOString() || null,
      stripe_customer_id: userData.stripe_customer_id || null,
      profile_title: userData.profile?.title || null,
      profile_company: userData.profile?.company || null,
      profile_location: userData.profile?.location || null,
      profile_about: userData.profile?.about || null,
      profile_phone: userData.profile?.phone || null,
      profile_website: userData.profile?.website || null,
      profile_linkedin: userData.profile?.linkedin || null,
      profile_skills: userData.profile?.skills || [],
      profile_points: userData.profile?.points || 0,
      connections: userData.connections || [],
      is_founder: userData.profile?.isFounder || false,
      founder_status: userData.profile?.founderStatus || null,
      company_stage: userData.profile?.companyStage || null,
      looking_for: userData.profile?.lookingFor || [],
      social_links: userData.profile?.socialLinks || {},
      bio: userData.profile?.bio || null,
      interests: userData.profile?.interests || []
    };

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/sync-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(syncData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to sync user to Supabase:', errorText);
        // Don't throw error to avoid breaking the auth flow
      } else {
        console.log('User synced to Supabase successfully');
      }
    } catch (fetchError) {
      console.error('Network error syncing user to Supabase:', fetchError);
      // Don't throw error to avoid breaking the auth flow
    }
  } catch (error) {
    console.error('Error syncing user to Supabase:', error);
    // Don't throw error to avoid breaking the auth flow
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authStateInitialized, setAuthStateInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Prevent multiple rapid calls during auth state changes
      if (shouldRateLimit('authStateChange')) {
        return;
      }

      if (firebaseUser) {
        try {
          // Check cache first
          const cachedData = getCachedUserData(firebaseUser.uid);
          if (cachedData && authStateInitialized) {
            setUser(cachedData);
            setLoading(false);
            return;
          }

          // Force reload from server to get latest emailVerified status
          try {
            await firebaseUser.reload();
          } catch (reloadError) {
            console.warn('Failed to reload user, continuing with cached data:', reloadError);
          }

          // Check again after reload
          const refreshedUser = auth.currentUser;
          
          if (!refreshedUser) {
            setUser(null);
            setLoading(false);
            return;
          }

          const userData = await getUserData(refreshedUser);
          setCachedUserData(refreshedUser.uid, userData);
          setUser(userData);
          
          // Sync user data to Supabase
          await syncUserToSupabase(userData);
        } catch (err) {
          console.error('Error getting user data:', err);
          // If we have cached data, use it as fallback
          const cachedData = getCachedUserData(firebaseUser.uid);
          if (cachedData) {
            setUser(cachedData);
          } else {
            setUser(null);
          }
        }
      } else {
        setUser(null);
        userDataCache.clear(); // Clear cache on logout
      }
      setAuthStateInitialized(true);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getUserData = async (firebaseUser: FirebaseUser): Promise<User> => {
    // Rate limit getUserData calls
      console.log("AUTH DEBUG: Getting user data for", firebaseUser.uid);
      
      // First try to get user data from Supabase as the source of truth
      try {
        const { data: supabaseUser, error } = await supabase
          .from('users')
          .select('*, subscription_trial_ends_at')
          .eq('id', firebaseUser.uid)
          .maybeSingle();
        
        if (error) {
          console.error("AUTH DEBUG: Error fetching user data from Supabase:", error.message);
        } else if (supabaseUser) {
          console.log("AUTH DEBUG: Found user data in Supabase, using as source of truth");
          
          // Update Firestore with the latest data from Supabase
          const userRef = doc(db, 'users', firebaseUser.uid);
          
          // Check if Firestore document exists
          const firestoreDoc = await getDoc(userRef);
          
          if (firestoreDoc.exists()) {
            // Update existing document
            await updateDoc(userRef, {
              name: supabaseUser.name,
              email: supabaseUser.email,
              role: supabaseUser.role || 'user',
              photoURL: supabaseUser.photo_url || null,
              email_verified: supabaseUser.email_verified || false,
              subscription: {
                status: supabaseUser.subscription_status || 'inactive',
                eventsQuota: supabaseUser.subscription_events_quota || 0,
                eventsUsed: supabaseUser.subscription_events_used || 0,
                trialEndsAt: supabaseUser.subscription_trial_ends_at ? new Date(supabaseUser.subscription_trial_ends_at) : null
              },
              profile: {
                title: supabaseUser.profile_title || '',
                company: supabaseUser.profile_company || '',
                location: supabaseUser.profile_location || '',
                about: supabaseUser.profile_about || '',
                phone: supabaseUser.profile_phone || '',
                website: supabaseUser.profile_website || '',
                linkedin: supabaseUser.profile_linkedin || '',
                skills: supabaseUser.profile_skills || [],
                points: supabaseUser.profile_points || 0,
                onboardingCompleted: true
              },
              stripe_customer_id: supabaseUser.stripe_customer_id || null,
              stripe_subscription_id: supabaseUser.stripe_subscription_id || null,
              stripe_subscription_status: supabaseUser.stripe_subscription_status || null,
              stripe_current_period_end: supabaseUser.stripe_current_period_end || null,
              connections: supabaseUser.connections || [],
              updatedAt: serverTimestamp()
            });
            
            console.log("AUTH DEBUG: Updated Firestore with Supabase data");
          } else {
            // Create new document
            await setDoc(userRef, {
              name: supabaseUser.name,
              email: supabaseUser.email,
              role: supabaseUser.role || 'user',
              photoURL: supabaseUser.photo_url || null,
              email_verified: supabaseUser.email_verified || false,
              subscription: {
                status: supabaseUser.subscription_status || 'inactive',
                eventsQuota: supabaseUser.subscription_events_quota || 0,
                eventsUsed: supabaseUser.subscription_events_used || 0,
                trialEndsAt: supabaseUser.subscription_trial_ends_at ? new Date(supabaseUser.subscription_trial_ends_at) : null
              },
              profile: {
                title: supabaseUser.profile_title || '',
                company: supabaseUser.profile_company || '',
                location: supabaseUser.profile_location || '',
                about: supabaseUser.profile_about || '',
                phone: supabaseUser.profile_phone || '',
                website: supabaseUser.profile_website || '',
                linkedin: supabaseUser.profile_linkedin || '',
                skills: supabaseUser.profile_skills || [],
                points: supabaseUser.profile_points || 0,
                onboardingCompleted: true
              },
              stripe_customer_id: supabaseUser.stripe_customer_id || null,
              stripe_subscription_id: supabaseUser.stripe_subscription_id || null,
              stripe_subscription_status: supabaseUser.stripe_subscription_status || null,
              stripe_current_period_end: supabaseUser.stripe_current_period_end || null,
              connections: supabaseUser.connections || [],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            
            console.log("AUTH DEBUG: Created new Firestore document with Supabase data");
          }
          
          // Return user data from Supabase
          const trialEndsAt = supabaseUser.subscription_trial_ends_at ? new Date(supabaseUser.subscription_trial_ends_at) : undefined;
          
          return {
            id: firebaseUser.uid,
            name: supabaseUser.name || '',
            email: supabaseUser.email || '',
            role: supabaseUser.role || 'user',
            photoURL: supabaseUser.photo_url || undefined,
            emailVerified: firebaseUser.emailVerified,
            dbEmailVerified: supabaseUser.email_verified || false,
            profile: {
              title: supabaseUser.profile_title || '',
              company: supabaseUser.profile_company || '',
              location: supabaseUser.profile_location || '',
              about: supabaseUser.profile_about || '',
              phone: supabaseUser.profile_phone || '',
              website: supabaseUser.profile_website || '',
              linkedin: supabaseUser.profile_linkedin || '',
              skills: supabaseUser.profile_skills || [],
              points: supabaseUser.profile_points || 0,
              onboardingCompleted: true
            },
            subscription: {
              status: supabaseUser.subscription_status || 'inactive',
              eventsQuota: supabaseUser.subscription_events_quota || 0,
              eventsUsed: supabaseUser.subscription_events_used || 0,
              trialEndsAt
            },
            stripe_customer_id: supabaseUser.stripe_customer_id || undefined,
            isNewUser: false,
            connections: supabaseUser.connections || []
          };
        }
    if (shouldRateLimit(`getUserData-${firebaseUser.uid}`)) {
      throw new Error('Rate limited: Too many requests');
    }

    try {
      console.log("AUTH DEBUG: Getting user data for", firebaseUser.uid);
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        
        // Check if we need to sync from Supabase
        const shouldSyncFromSupabase = await checkSupabaseForUpdates(firebaseUser.uid, userData);
        
        if (shouldSyncFromSupabase) {
          console.log("AUTH DEBUG: Syncing from Supabase to Firestore for user", firebaseUser.uid);
          const updatedUserData = await syncFromSupabaseToFirestore(firebaseUser.uid);
          if (updatedUserData) {
            // Return the updated data from Supabase
            return updatedUserData;
          }
        }
        
        // Get email verification status from database
        const dbEmailVerified = userData.email_verified || false;
        
        const trialEndsAt = userData.subscription?.trialEndsAt?.toDate?.();

        return {
          id: firebaseUser.uid,
          name: userData.name || firebaseUser.displayName || '',
          email: userData.email || firebaseUser.email || '',
          role: userData.role || 'user',
          photoURL: userData.photoURL || firebaseUser.photoURL || undefined,
          emailVerified: firebaseUser.emailVerified,
          dbEmailVerified: dbEmailVerified,
          profile: userData.profile || {},
          subscription: {
            status: userData.subscription?.status || 'inactive',
            eventsQuota: userData.subscription?.eventsQuota || 0,
            eventsUsed: userData.subscription?.eventsUsed || 0,
            trialEndsAt: trialEndsAt || undefined
          },
          stripe_customer_id: userData.stripe_customer_id,
          isNewUser: userData.isNewUser || false,
          connections: userData.connections || []
        };
      } else {
        // Create a new user document if it doesn't exist
        const newUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          role: 'user',
          photoURL: firebaseUser.photoURL || null,
          emailVerified: firebaseUser.emailVerified,
          dbEmailVerified: false,
          profile: {},
          subscription: {
            status: 'inactive',
            eventsQuota: 0,
            eventsUsed: 0
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isNewUser: true,
          connections: []
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
          isNewUser: true,
          connections: []
        });

        return newUser;
      }
    } catch (err) {
      console.error('Error in getUserData:', err);
      throw err;
    }
  };

  // Check if Supabase has newer subscription data than Firestore
  const checkSupabaseForUpdates = async (userId: string, firestoreData: any): Promise<boolean> => {
    try {
      // Get Supabase data
      const { data: supabaseUsers, error } = await supabase
        .from('users')
        .select('subscription_status, subscription_events_quota, stripe_subscription_id, updated_at')
        .eq('id', userId);
      
      if (error || !supabaseUsers || supabaseUsers.length === 0) {
        console.log("AUTH DEBUG: No Supabase data found or error:", error?.message);
        return false;
      }
      
      const supabaseUser = supabaseUsers[0];
      
      // Check if Supabase has different subscription data
      const hasNewerSubscriptionData = 
        supabaseUser.subscription_status !== firestoreData.subscription?.status ||
        supabaseUser.subscription_events_quota !== firestoreData.subscription?.eventsQuota ||
        supabaseUser.stripe_subscription_id !== firestoreData.stripe_subscription_id;
      
      if (hasNewerSubscriptionData) {
        console.log("AUTH DEBUG: Supabase has newer subscription data for user", userId);
        console.log("Supabase:", {
          status: supabaseUser.subscription_status,
          quota: supabaseUser.subscription_events_quota,
          subId: supabaseUser.stripe_subscription_id
        });
        console.log("Firestore:", {
          status: firestoreData.subscription?.status,
          quota: firestoreData.subscription?.eventsQuota,
          subId: firestoreData.stripe_subscription_id
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error checking Supabase for updates:", error);
      return false;
    }
  };
  
  // Sync data from Supabase to Firestore
  const syncFromSupabaseToFirestore = async (userId: string): Promise<User | null> => {
    try {
      // Get full user data from Supabase
      const { data: supabaseUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error || !supabaseUser) {
        console.error("Error getting Supabase user data:", error);
        return null;
      }
      
      // Update Firestore with Supabase data
      const userRef = doc(db, 'users', userId);
      
      // Prepare subscription data
      const subscriptionData = {
        status: supabaseUser.subscription_status || 'inactive',
        eventsQuota: supabaseUser.subscription_events_quota || 0,
        eventsUsed: supabaseUser.subscription_events_used || 0,
        trialEndsAt: supabaseUser.subscription_trial_ends_at ? new Date(supabaseUser.subscription_trial_ends_at) : undefined
      };
      
      // Update Firestore document
      await updateDoc(userRef, {
        subscription: subscriptionData,
        stripe_customer_id: supabaseUser.stripe_customer_id,
        stripe_subscription_id: supabaseUser.stripe_subscription_id,
        stripe_subscription_status: supabaseUser.stripe_subscription_status,
        updatedAt: serverTimestamp()
      });
      
      console.log("AUTH DEBUG: Updated Firestore from Supabase for user", userId);
      
      // Get the updated user data
      const updatedUserSnap = await getDoc(userRef);
      if (!updatedUserSnap.exists()) {
        return null;
      }
      
      const updatedUserData = updatedUserSnap.data();
      
      // Construct and return the user object
      const trialEndsAt = updatedUserData.subscription?.trialEndsAt?.toDate?.();
      
      return {
        id: userId,
        name: updatedUserData.name || '',
        email: updatedUserData.email || '',
        role: updatedUserData.role || 'user',
        photoURL: updatedUserData.photoURL || undefined,
        emailVerified: auth.currentUser?.emailVerified || false,
        dbEmailVerified: updatedUserData.email_verified || false,
        profile: updatedUserData.profile || {},
        subscription: {
          status: updatedUserData.subscription?.status || 'inactive',
          eventsQuota: updatedUserData.subscription?.eventsQuota || 0,
          eventsUsed: updatedUserData.subscription?.eventsUsed || 0,
          trialEndsAt: trialEndsAt || undefined
        },
        stripe_customer_id: updatedUserData.stripe_customer_id,
        isNewUser: updatedUserData.isNewUser || false,
        connections: updatedUserData.connections || []
      };
    } catch (error) {
      console.error("Error syncing from Supabase to Firestore:", error);
      return null;
    }
  };

  const signup = async (email: string, password: string, name: string, isNewUser: boolean = true) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send email verification
      await sendVerificationEmail(userCredential.user);
      
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

      toast.success('Account created successfully! Please check your email to verify your account.');
      
      // Get the created user data and sync to Supabase
      const createdUserData = await getUserData(userCredential.user);
      await syncUserToSupabase(createdUserData);
      
      return userCredential;
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        toast.error('Please verify your email before logging in.');
        await signOut(auth);
        throw new Error('Email not verified');
      }
      
      toast.success('Logged in successfully!');
      return userCredential;
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
        await setDoc(userRef, {
          name: result.user.displayName,
          email: result.user.email,
          role: 'user',
          photoURL: result.user.photoURL || null,
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
      
      // Get user data and sync to Supabase
      const userData = await getUserData(result.user);
      await syncUserToSupabase(userData);
      
      return result;
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Failed to log in with Google');
      toast.error(err.message || 'Failed to log in with Google');
      throw err;
    }
  };

  const logout = async () => {
    try {
      // Clear cache on logout
      userDataCache.clear();
      operationTimestamps.clear();
      
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
      // Rate limit profile updates
      if (shouldRateLimit(`updateProfile-${userId}`)) {
        throw new Error('Please wait before updating your profile again');
      }
      
      const userRef = doc(db, 'users', userId);
      
      // Prepare update data
      const updateData: any = {
        updatedAt: serverTimestamp()
      };
      
      // Handle top-level fields
      if (profileData.name) updateData.name = profileData.name;
      if (profileData.photoURL !== undefined) updateData.photoURL = profileData.photoURL || null;
      
      // Handle profile fields
      Object.keys(profileData).forEach(key => {
        if (key !== 'name' && key !== 'photoURL') {
          updateData[`profile.${key}`] = profileData[key];
        }
      });
      
      await updateDoc(userRef, updateData);
      
      // Clear cache for this user to force refresh
      userDataCache.delete(userId);
      
      // Update local user state
      if (user && user.id === userId) {
        setUser(prev => {
          if (!prev) return null;
          
          const updatedUser = {
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
          
          // Update cache with new data
          setCachedUserData(userId, updatedUser);
          return updatedUser;
        });
      }
      
      // Sync updated user data to Supabase
      if (user && user.id === userId) {
        const updatedUserForSync = {
          ...user,
          name: profileData.name || user.name,
          photoURL: profileData.photoURL !== undefined ? profileData.photoURL : user.photoURL,
          profile: {
            ...user.profile,
            ...Object.fromEntries(
              Object.entries(profileData).filter(([key]) => 
                key !== 'name' && key !== 'photoURL'
              )
            )
          }
        };
        await syncUserToSupabase(updatedUserForSync);
      }
      
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      console.error('Profile update error:', err);
      
      if (err.code === 'resource-exhausted') {
        toast.error('Service temporarily unavailable. Please try again in a few minutes.');
      } else {
        toast.error(err.message || 'Failed to update profile');
      }
      throw err;
    }
  };

  const startFreeTrial = async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Rate limit trial activation
      if (shouldRateLimit(`startTrial-${user.id}`)) {
        throw new Error('Please wait before trying again');
      }
      
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
      
      // Clear cache to force refresh
      userDataCache.delete(user.id);
      
      // Update local user state
      setUser(prev => {
        if (!prev) return null;
        
        const updatedUser = {
          ...prev,
          subscription: {
            ...prev.subscription,
            status: 'trial',
            eventsQuota: 2,
            eventsUsed: 0,
            trialEndsAt
          }
        };
        
        // Update cache with new data
        setCachedUserData(prev.id, updatedUser);
        return updatedUser;
      });
      
      // Sync updated user data to Supabase
      const updatedUserForSync = {
        ...user,
        subscription: {
          ...user.subscription,
          status: 'trial',
          eventsQuota: 2,
          eventsUsed: 0,
          trialEndsAt
        }
      };
      await syncUserToSupabase(updatedUserForSync);
      
      toast.success('Free trial activated successfully!');
    } catch (err: any) {
      console.error('Free trial activation error:', err);
      
      if (err.code === 'resource-exhausted') {
        toast.error('Service temporarily unavailable. Please try again in a few minutes.');
      } else {
        toast.error(err.message || 'Failed to activate free trial');
      }
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Rate limit password reset requests
      if (shouldRateLimit(`resetPassword-${email}`)) {
        throw new Error('Please wait before requesting another password reset');
      }
      
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Please check your inbox.');
    } catch (err: any) {
      console.error('Error sending password reset email:', err);
      toast.error(err.message || 'Failed to send password reset email');
      throw err;
    }
  };

  const confirmResetPassword = async (code: string, newPassword: string) => {
    try {
      await confirmPasswordReset(auth, code, newPassword);
      toast.success('Password reset successfully! You can now log in with your new password.');
    } catch (err: any) {
      console.error('Error resetting password:', err);
      toast.error(err.message || 'Failed to reset password');
      throw err;
    }
  };

  const sendVerificationEmail = async (user: FirebaseUser) => {
    try {
      // Rate limit verification email sending
      if (shouldRateLimit(`sendVerification-${user.uid}`)) {
        throw new Error('Please wait before requesting another verification email');
      }
      
      await sendEmailVerification(user);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      console.error('Error sending verification email:', err);
      toast.error(err.message || 'Failed to send verification email');
      throw err;
    }
  };

  const verifyEmail = async (actionCode: string) => {
    try {
      await applyActionCode(auth, actionCode);
      console.log("Email verification code applied successfully");
      
      // After applying the action code, reload the current user to get updated emailVerified status
      let updatedEmailVerified = false;
      if (auth.currentUser) {
        try {
          await auth.currentUser.reload();
        } catch (reloadError) {
          console.warn('Failed to reload user after email verification:', reloadError);
        }
        updatedEmailVerified = auth.currentUser.emailVerified;
        console.log("User reloaded, emailVerified status:", updatedEmailVerified);
        
        // Get the refreshed user data and update the user state
        if (auth.currentUser) {
          // Clear cache to force fresh data
          userDataCache.delete(auth.currentUser.uid);
          const updatedUserData = await getUserData(auth.currentUser);
          setUser(updatedUserData);
          
          // Also update the database verification status
          if (updatedEmailVerified) {
            console.log("Updating database email verification status");
            try {
              await markEmailVerified(auth.currentUser.uid);
            } catch (markError) {
              console.warn('Failed to mark email as verified in database:', markError);
            }
          }
        }
      }
      
      toast.success('Email verified successfully!');
      return updatedEmailVerified;
    } catch (err: any) {
      console.error('Error verifying email:', err);
      toast.error(err.message || 'Failed to verify email');
      throw err;
    }
  };

  const markEmailVerified = async (userId: string) => {
    try {
      // Rate limit email verification marking
      if (shouldRateLimit(`markEmailVerified-${userId}`)) {
        console.warn('Rate limited: markEmailVerified');
        return;
      }
      
      // Update Firestore
      console.log("Updating Firestore email verification for user", userId);
      const userRef = doc(db, 'users', userId);
      try {
        await updateDoc(userRef, {
          'email_verified': true,
          'email_verified_at': serverTimestamp(),
          'updatedAt': serverTimestamp()
        });
      } catch (firestoreError: any) {
        console.warn('Failed to update Firestore email verification:', firestoreError);
        // Continue with Supabase update even if Firestore fails
      }
      
      // Update Supabase
      console.log("Updating Supabase email verification for user", userId);
      const { error } = await supabase
        .from('users')
        .update({ 
          email_verified: true,
          email_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (error) {
        console.error('Error updating Supabase email verification:', error);
      }
      
      // Clear cache to force refresh
      userDataCache.delete(userId);
      
      // Update local state
      setUser(prev => {
        if (!prev) return null;
        console.log("Updating local user state with verified email");
        const updatedUser = {
          ...prev,
          dbEmailVerified: true
        };
        
        // Update cache with new data
        setCachedUserData(userId, updatedUser);
        return updatedUser;
      });
      
      // Sync updated user data to Supabase
      if (user && user.id === userId) {
        const updatedUserForSync = {
          ...user,
          dbEmailVerified: true
        };
        await syncUserToSupabase(updatedUserForSync);
      }
      
      console.log("AUTH DEBUG: Email verification status updated in database for user", userId);
    } catch (error) {
      console.error('Error marking email as verified in database:', error);
      throw error;
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
        startFreeTrial,
        resetPassword,
        markEmailVerified,
        confirmResetPassword,
        sendVerificationEmail,
        verifyEmail
      }}
    >
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