import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { toast } from 'react-hot-toast';
import type { User, Session } from '@supabase/supabase-js';

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

async function createOrUpdateUserProfile(user: User, name?: string): Promise<UserProfile> {
  try {
    // Check if user profile exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    const isAdmin = user.email === ADMIN_EMAIL;
    const userData = {
      id: user.id,
      email: user.email || '',
      name: name || user.user_metadata?.full_name || existingUser?.name || '',
      role: isAdmin ? 'admin' : 'user',
      photo_url: user.user_metadata?.avatar_url || existingUser?.photo_url,
      subscription_status: isAdmin ? 'active' : (existingUser?.subscription_status || 'inactive'),
      subscription_events_quota: isAdmin ? 999999 : (existingUser?.subscription_events_quota || 0),
      subscription_events_used: existingUser?.subscription_events_used || 0,
      profile_points: existingUser?.profile_points || 0,
      connections: existingUser?.connections || [],
      updated_at: new Date().toISOString(),
    };

    if (!existingUser) {
      userData.created_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('users')
      .upsert(userData)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      photoURL: data.photo_url,
      subscription: {
        status: data.subscription_status,
        trialEndsAt: data.subscription_trial_ends_at ? new Date(data.subscription_trial_ends_at) : undefined,
        eventsQuota: data.subscription_events_quota,
        eventsUsed: data.subscription_events_used,
      },
      profile: {
        title: data.profile_title,
        company: data.profile_company,
        location: data.profile_location,
        about: data.profile_about,
        phone: data.profile_phone,
        website: data.profile_website,
        linkedin: data.profile_linkedin,
        skills: data.profile_skills || [],
        points: data.profile_points,
        joinedAt: data.created_at ? new Date(data.created_at) : undefined,
      },
      connections: data.connections || [],
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        createOrUpdateUserProfile(session.user).then(setUser).catch(console.error);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const userProfile = await createOrUpdateUserProfile(session.user);
          setUser(userProfile);
        } catch (error) {
          console.error('Error handling auth state change:', error);
          toast.error('Error loading user data');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const userProfile = await createOrUpdateUserProfile(data.user);
        setUser(userProfile);
        toast.success(`Welcome back${userProfile.role === 'admin' ? ', Admin' : ''}!`);
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.message || 'Login failed. Please try again.');
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/events`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Google login failed:', error);
      toast.error('Google sign-in failed. Please try again.');
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        const userProfile = await createOrUpdateUserProfile(data.user, name);
        setUser(userProfile);
        toast.success('Account created successfully!');
      }
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

      const { error } = await supabase
        .from('users')
        .update({
          subscription_status: 'trial',
          subscription_trial_ends_at: trialEndsAt.toISOString(),
          subscription_events_quota: 2,
          subscription_events_used: 0,
        })
        .eq('id', user.id);

      if (error) throw error;

      const updatedUser: UserProfile = {
        ...user,
        subscription: {
          status: 'trial',
          trialEndsAt,
          eventsQuota: 2,
          eventsUsed: 0,
        }
      };

      setUser(updatedUser);
      toast.success('Free trial activated successfully!');
    } catch (error: any) {
      console.error('Failed to start trial:', error);
      toast.error('Failed to activate free trial. Please try again.');
      throw error;
    }
  };

  const updateUserProfile = async (userId: string, profileData: any) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: profileData.name,
          profile_title: profileData.title,
          profile_company: profileData.company,
          profile_location: profileData.location,
          profile_about: profileData.about,
          profile_phone: profileData.phone,
          profile_website: profileData.website,
          profile_linkedin: profileData.linkedin,
          profile_skills: profileData.skills,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      // Update local user state
      if (user && user.id === userId) {
        const updatedUser = {
          ...user,
          name: profileData.name,
          profile: {
            ...user.profile,
            title: profileData.title,
            company: profileData.company,
            location: profileData.location,
            about: profileData.about,
            phone: profileData.phone,
            website: profileData.website,
            linkedin: profileData.linkedin,
            skills: profileData.skills,
          }
        };
        setUser(updatedUser);
      }
    } catch (error: any) {
      console.error('Error updating user profile:', error);
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