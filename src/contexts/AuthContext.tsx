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
    // Basic Info
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
    
    // Professional Background
    yearsExperience?: number;
    experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
    industry?: string;
    companySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
    previousCompanies?: string;
    specializations?: string[];
    certifications?: string;
    
    // Goals & Motivations
    primaryGoal?: 'networking' | 'learning' | 'career_growth' | 'business_development' | 'mentoring';
    careerAspirations?: string;
    currentChallenges?: string[];
    valueProposition?: string;
    achievements?: string;
    
    // Networking & Communication
    networkingStyle?: 'introvert' | 'extrovert' | 'ambivert';
    communicationPreference?: 'direct' | 'collaborative' | 'analytical' | 'creative';
    interests?: string[];
    eventPreferences?: string[];
    
    // Availability & Preferences
    availability?: 'very_active' | 'moderately_active' | 'occasional';
    timeZone?: string;
    preferredMeetingTimes?: string[];
    
    // Assigned Role
    assignedRole?: string;
    onboardingCompleted?: boolean;
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

// Function to sync user data to Supabase via Edge Function
async function syncUserToSupabase(userData: {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  photo_url?: string;
  subscription_status: string;
  subscription_trial_ends_at?: Date;
  subscription_events_quota: number;
  subscription_events_used: number;
  profile_title?: string;
  profile_company?: string;
  profile_location?: string;
  profile_about?: string;
  profile_phone?: string;
  profile_website?: string;
  profile_linkedin?: string;
  profile_skills?: string[];
  profile_points?: number;
  connections?: string[];
}) {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    if (!supabaseUrl) {
      console.warn('Supabase URL not found, skipping user sync');
      return;
    }

    // Use Edge Function for secure user sync instead of direct API call
    const response = await fetch(`${supabaseUrl}/functions/v1/sync-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('Failed to sync user to Supabase via Edge Function:', response.status, errorText);
      // Don't throw error to prevent blocking user authentication
    }
  } catch (error) {
    console.warn('Error syncing user to Supabase:', error);
    // Don't throw error to prevent blocking user authentication
  }
}

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
        // Basic Info
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
        
        // Professional Background
        yearsExperience: existingData.profile?.yearsExperience || 0,
        experienceLevel: existingData.profile?.experienceLevel || 'entry',
        industry: existingData.profile?.industry || '',
        companySize: existingData.profile?.companySize || 'startup',
        previousCompanies: existingData.profile?.previousCompanies || '',
        specializations: existingData.profile?.specializations || [],
        certifications: existingData.profile?.certifications || '',
        
        // Goals & Motivations
        primaryGoal: existingData.profile?.primaryGoal || 'networking',
        careerAspirations: existingData.profile?.careerAspirations || '',
        currentChallenges: existingData.profile?.currentChallenges || [],
        valueProposition: existingData.profile?.valueProposition || '',
        achievements: existingData.profile?.achievements || '',
        
        // Networking & Communication
        networkingStyle: existingData.profile?.networkingStyle || 'ambivert',
        communicationPreference: existingData.profile?.communicationPreference || 'collaborative',
        interests: existingData.profile?.interests || [],
        eventPreferences: existingData.profile?.eventPreferences || [],
        
        // Availability & Preferences
        availability: existingData.profile?.availability || 'moderately_active',
        timeZone: existingData.profile?.timeZone || '',
        preferredMeetingTimes: existingData.profile?.preferredMeetingTimes || [],
        
        // Assigned Role
        assignedRole: existingData.profile?.assignedRole || '',
        onboardingCompleted: existingData.profile?.onboardingCompleted || false,
      },
      connections: existingData.connections || [],
      createdAt: existingData.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, userData, { merge: true });

    // Sync user data to Supabase for billing functionality (non-blocking)
    syncUserToSupabase({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role as 'user' | 'admin',
      photo_url: userData.photoURL || undefined,
      subscription_status: userData.subscription.status,
      subscription_trial_ends_at: userData.subscription.trialEndsAt || undefined,
      subscription_events_quota: userData.subscription.eventsQuota,
      subscription_events_used: userData.subscription.eventsUsed,
      profile_title: userData.profile.title || undefined,
      profile_company: userData.profile.company || undefined,
      profile_location: userData.profile.location || undefined,
      profile_about: userData.profile.about || undefined,
      profile_phone: userData.profile.phone || undefined,
      profile_website: userData.profile.website || undefined,
      profile_linkedin: userData.profile.linkedin || undefined,
      profile_skills: userData.profile.skills,
      profile_points: userData.profile.points,
      connections: userData.connections,
    });

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

      // Also sync the updated subscription status to Supabase (non-blocking)
      syncUserToSupabase({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        photo_url: user.photoURL || undefined,
        subscription_status: 'trial',
        subscription_trial_ends_at: trialEndsAt,
        subscription_events_quota: 2,
        subscription_events_used: 0,
        profile_title: user.profile?.title || undefined,
        profile_company: user.profile?.company || undefined,
        profile_location: user.profile?.location || undefined,
        profile_about: user.profile?.about || undefined,
        profile_phone: user.profile?.phone || undefined,
        profile_website: user.profile?.website || undefined,
        profile_linkedin: user.profile?.linkedin || undefined,
        profile_skills: user.profile?.skills || [],
        profile_points: user.profile?.points || 0,
        connections: user.connections || [],
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
      
      // Prepare the update data with nested profile structure
      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      // Handle basic profile fields
      if (profileData.name !== undefined) updateData.name = profileData.name;
      if (profileData.title !== undefined) updateData['profile.title'] = profileData.title;
      if (profileData.company !== undefined) updateData['profile.company'] = profileData.company;
      if (profileData.location !== undefined) updateData['profile.location'] = profileData.location;
      if (profileData.about !== undefined) updateData['profile.about'] = profileData.about;
      if (profileData.phone !== undefined) updateData['profile.phone'] = profileData.phone;
      if (profileData.website !== undefined) updateData['profile.website'] = profileData.website;
      if (profileData.linkedin !== undefined) updateData['profile.linkedin'] = profileData.linkedin;
      if (profileData.skills !== undefined) updateData['profile.skills'] = profileData.skills;

      // Handle professional background
      if (profileData.yearsExperience !== undefined) updateData['profile.yearsExperience'] = profileData.yearsExperience;
      if (profileData.experienceLevel !== undefined) updateData['profile.experienceLevel'] = profileData.experienceLevel;
      if (profileData.industry !== undefined) updateData['profile.industry'] = profileData.industry;
      if (profileData.companySize !== undefined) updateData['profile.companySize'] = profileData.companySize;
      if (profileData.previousCompanies !== undefined) updateData['profile.previousCompanies'] = profileData.previousCompanies;
      if (profileData.specializations !== undefined) updateData['profile.specializations'] = profileData.specializations;
      if (profileData.certifications !== undefined) updateData['profile.certifications'] = profileData.certifications;

      // Handle goals & motivations
      if (profileData.primaryGoal !== undefined) updateData['profile.primaryGoal'] = profileData.primaryGoal;
      if (profileData.careerAspirations !== undefined) updateData['profile.careerAspirations'] = profileData.careerAspirations;
      if (profileData.currentChallenges !== undefined) updateData['profile.currentChallenges'] = profileData.currentChallenges;
      if (profileData.valueProposition !== undefined) updateData['profile.valueProposition'] = profileData.valueProposition;
      if (profileData.achievements !== undefined) updateData['profile.achievements'] = profileData.achievements;

      // Handle networking & communication
      if (profileData.networkingStyle !== undefined) updateData['profile.networkingStyle'] = profileData.networkingStyle;
      if (profileData.communicationPreference !== undefined) updateData['profile.communicationPreference'] = profileData.communicationPreference;
      if (profileData.interests !== undefined) updateData['profile.interests'] = profileData.interests;
      if (profileData.eventPreferences !== undefined) updateData['profile.eventPreferences'] = profileData.eventPreferences;

      // Handle availability & preferences
      if (profileData.availability !== undefined) updateData['profile.availability'] = profileData.availability;
      if (profileData.timeZone !== undefined) updateData['profile.timeZone'] = profileData.timeZone;
      if (profileData.preferredMeetingTimes !== undefined) updateData['profile.preferredMeetingTimes'] = profileData.preferredMeetingTimes;

      // Handle assigned role
      if (profileData.assignedRole !== undefined) updateData['profile.assignedRole'] = profileData.assignedRole;
      if (profileData.onboardingCompleted !== undefined) updateData['profile.onboardingCompleted'] = profileData.onboardingCompleted;

      await updateDoc(userRef, updateData);

      // Get the current user data to sync to Supabase
      if (user) {
        const updatedUserData = { ...user };
        
        // Apply the updates to the local user data for syncing
        if (profileData.name !== undefined) updatedUserData.name = profileData.name;
        if (profileData.title !== undefined && updatedUserData.profile) updatedUserData.profile.title = profileData.title;
        if (profileData.company !== undefined && updatedUserData.profile) updatedUserData.profile.company = profileData.company;
        if (profileData.location !== undefined && updatedUserData.profile) updatedUserData.profile.location = profileData.location;
        if (profileData.about !== undefined && updatedUserData.profile) updatedUserData.profile.about = profileData.about;
        if (profileData.phone !== undefined && updatedUserData.profile) updatedUserData.profile.phone = profileData.phone;
        if (profileData.website !== undefined && updatedUserData.profile) updatedUserData.profile.website = profileData.website;
        if (profileData.linkedin !== undefined && updatedUserData.profile) updatedUserData.profile.linkedin = profileData.linkedin;
        if (profileData.skills !== undefined && updatedUserData.profile) updatedUserData.profile.skills = profileData.skills;

        // Sync updated data to Supabase (non-blocking)
        syncUserToSupabase({
          id: updatedUserData.id,
          email: updatedUserData.email,
          name: updatedUserData.name,
          role: updatedUserData.role,
          photo_url: updatedUserData.photoURL || undefined,
          subscription_status: updatedUserData.subscription.status,
          subscription_trial_ends_at: updatedUserData.subscription.trialEndsAt || undefined,
          subscription_events_quota: updatedUserData.subscription.eventsQuota,
          subscription_events_used: updatedUserData.subscription.eventsUsed,
          profile_title: updatedUserData.profile?.title || undefined,
          profile_company: updatedUserData.profile?.company || undefined,
          profile_location: updatedUserData.profile?.location || undefined,
          profile_about: updatedUserData.profile?.about || undefined,
          profile_phone: updatedUserData.profile?.phone || undefined,
          profile_website: updatedUserData.profile?.website || undefined,
          profile_linkedin: updatedUserData.profile?.linkedin || undefined,
          profile_skills: updatedUserData.profile?.skills || [],
          profile_points: updatedUserData.profile?.points || 0,
          connections: updatedUserData.connections || [],
        });
      }
      
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