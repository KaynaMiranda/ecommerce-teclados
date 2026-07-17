import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile, UserRole } from '../types';

interface AuthStore {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role?: UserRole) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  isAdmin: () => boolean;
  isStaff: () => boolean;
  isB2C: () => boolean;
  isB2B: () => boolean;
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user ?? null;
    let profile = null;

    if (user) {
      profile = await fetchProfile(user.id);
    }

    set({
      user,
      session,
      profile,
      loading: false,
    });

    supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      let profile = null;

      if (user) {
        profile = await fetchProfile(user.id);
      }

      set({
        user,
        session,
        profile,
      });
    });
  },

  signUp: async (email, password, fullName, role = 'b2c_client') => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return { error: 'Este email já está cadastrado' };
      }
      return { error: error.message };
    }

    return {};
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login')) {
        return { error: 'Email ou senha inválidos' };
      }
      return { error: error.message };
    }

    return {};
  },

  signInWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null });
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  },

  isAdmin: () => {
    const { profile } = get();
    return profile?.role === 'admin' || profile?.is_admin === true;
  },

  isStaff: () => {
    const { profile } = get();
    return profile?.role === 'admin' || profile?.role === 'attendant' || profile?.role === 'manager';
  },

  isB2C: () => {
    const { profile } = get();
    return profile?.role === 'b2c_client';
  },

  isB2B: () => {
    const { profile } = get();
    return profile?.role === 'b2b_client';
  },
}));
