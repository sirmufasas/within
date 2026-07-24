'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Business {
  id: string;
  slug: string;
  name: string;
  business_type: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  subscription_status: string;
  plan: string;
  trial_ends_at: string | null;
  phone: string | null;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  phone: string | null;
}

interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;
  userProfile: UserProfile | null;
  business: Business | null;
  isSuperAdmin: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  getCurrentUser: () => Promise<any>;
  isEmailVerified: () => boolean;
  getUserProfile: () => Promise<any>;
  refreshBusiness: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const supabase = createClient();

  const loadUserData = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profile) setUserProfile(profile);

      const { data: businessUser } = await supabase
        .from('business_users')
        .select('business_id, role')
        .eq('user_id', userId)
        .maybeSingle();

      if (businessUser?.business_id) {
        const { data: biz } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', businessUser.business_id)
          .maybeSingle();
        if (biz) setBusiness(biz);
      }
    } catch (err) {
      console.log('Error loading user data:', err);
    }
  };

  const refreshBusiness = async () => {
    if (!user) return;
    await loadUserData(user.id);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) loadUserData(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setUserProfile(null);
        setBusiness(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata: any = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata?.fullName || '',
          role: metadata?.role || 'owner',
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUserProfile(null);
    setBusiness(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  };

  const isEmailVerified = () => user?.email_confirmed_at !== null;

  const getUserProfile = async () => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) throw error;
    return data;
  };

  const isSuperAdmin = userProfile?.role === 'super_admin';

  return (
    <AuthContext.Provider value={{
      user, session, loading, userProfile, business, isSuperAdmin,
      signUp, signIn, signOut, getCurrentUser, isEmailVerified, getUserProfile, refreshBusiness,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
