import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { toast } from 'react-hot-toast';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
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
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  startFreeTrial: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_EMAIL = 'admin@inrooms.com';

async function createOrUpdateUser(supabaseUser: SupabaseUser, name?: string): Promise<User> {
  try {
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    let userData: User = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: name || existingUser?.name || supabaseUser.user_metadata?.name || '',
      role: supabaseUser.email === ADMIN_EMAIL ? 'admin' : 'user',
      subscription: {
        status: 'inactive',
        eventsQuota: 0,
        eventsUsed: 0
      }
    };

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (!existingUser) {
      // For admin user, set special subscription status
      if (supabaseUser.email === ADMIN_EMAIL) {
        userData.subscription.status = 'active';
        userData.subscription.eventsQuota = 999999;
        userData.name = 'Admin';
      }

      const { error: insertError } = await supabase
        .from('users')
        .insert([userData]);

      if (insertError) throw insertError;
    } else {
      userData = { ...existingUser, ...userData };
      if (existingUser.subscription) {
        userData.subscription = {
          ...userData.subscription,
          ...existingUser.subscription,
          trialEndsAt: existingUser.subscription.trialEndsAt 
            ? new Date(existingUser.subscription.trialEndsAt) 
            : undefined
        };
      }

      const { error: updateError } = await supabase
        .from('users')
        .update(userData)
        .eq('id', supabaseUser.id);

      if (updateError) throw updateError;
    }

    return userData;
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        createOrUpdateUser(session.user).then(setUser).catch(console.error);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            const userData = await createOrUpdateUser(session.user);
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
      }
    );

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
        const userData = await createOrUpdateUser(data.user);
        setUser(userData);
        toast.success(`Welcome back${userData.role === 'admin' ? ', Admin' : ''}!`);
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error.message?.includes('Invalid login credentials')) {
        toast.error('Invalid email or password');
      } else {
        toast.error('Login failed. Please try again.');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        const userData = await createOrUpdateUser(data.user, name);
        setUser(userData);
        toast.success('Account created successfully!');
      }
    } catch (error: any) {
      console.error('Signup failed:', error);
      if (error.message?.includes('already registered')) {
        toast.error('This email is already registered. Please try logging in instead.');
      } else if (error.message?.includes('Password should be')) {
        toast.error('Password is too weak. Please use a stronger password.');
      } else if (error.message?.includes('Invalid email')) {
        toast.error('Invalid email address. Please check and try again.');
      } else {
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

      const { error } = await supabase
        .from('users')
        .update({ subscription: updatedUser.subscription })
        .eq('id', user.id);

      if (error) throw error;

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