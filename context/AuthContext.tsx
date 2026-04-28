"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Profile } from "@/types/database";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import * as authService from "@/lib/supabase/services/auth.service";
import * as profileService from "@/lib/supabase/services/profile.service";
import { signupSyncUserProfile } from "@/lib/supabase/services/sync.service";
import type { Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: Profile | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: { email: string; password: string; first_name: string; last_name: string; plan: "monthly" | "yearly"; charity_id: string; contribution_percentage: number }) => Promise<Profile>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (s: Session | null) => {
    if (!s?.user) {
      setUser(null);
      return;
    }

    console.group(`[AuthContext] Loading profile for ${s.user.email}`);
    try {
      // Attempt to fetch profile
      let profile = await profileService.getProfile(s.user.id);
      
      // SELF-HEAL: If profile is missing but auth user exists, sync it
      if (!profile) {
        console.warn('[AuthContext] Profile missing during load. Triggering self-heal...');
        const syncResult = await signupSyncUserProfile(
          s.user.id,
          s.user.email || '',
          {
            first_name: s.user.user_metadata?.first_name || 'User',
            last_name: s.user.user_metadata?.last_name || '',
          },
          'subscriber'
        );
        profile = syncResult.profile;
        console.log('[AuthContext] Self-healing successful');
      } else {
        console.log('[AuthContext] Profile loaded successfully');
      }

      setUser(profile);
    } catch (err) {
      console.error('[AuthContext] Profile loading failed:', err);
      setUser(null);
    } finally {
      console.groupEnd();
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    console.log('[AuthContext] Initializing auth state...');

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) {
        loadProfile(s).finally(() => {
          setIsLoading(false);
          console.log('[AuthContext] Initial session loaded');
        });
      } else {
        setIsLoading(false);
        console.log('[AuthContext] No initial session found');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      console.log(`[AuthContext] Auth state change: ${event}`);
      setSession(s);
      
      if (s) {
        await loadProfile(s);
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { session: s } = await authService.signIn(email, password);
      setSession(s);
      if (s) {
        await loadProfile(s);
        return true;
      }
      return false;
    } catch (err) {
      console.error('[AuthContext] Login failed:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: { 
    email: string; 
    password: string; 
    first_name: string; 
    last_name: string; 
    plan: "monthly" | "yearly"; 
    charity_id: string; 
    contribution_percentage: number 
  }): Promise<Profile> => {
    console.group('[AuthContext] Starting signup flow');
    setIsLoading(true);
    
    try {
      // 1. Auth Signup
      console.log('[AuthContext] Step 1: Auth signup...');
      const { user: authUser } = await authService.signUp(data.email, data.password, { 
        first_name: data.first_name, 
        last_name: data.last_name 
      });
      
      if (!authUser) {
        throw new Error("Critical: Auth signup failed to return a user record.");
      }

      // 2. Synchronize Profile, Subscription, and Charity Selection
      console.log('[AuthContext] Step 2: Synchronizing application data...');
      const syncResult = await signupSyncUserProfile(
        authUser.id,
        data.email,
        {
          first_name: data.first_name,
          last_name: data.last_name,
          plan: data.plan,
          charity_id: data.charity_id,
          contribution_percentage: data.contribution_percentage
        }
      );

      console.log('[AuthContext] Signup flow completed successfully');
      setUser(syncResult.profile);
      return syncResult.profile;
    } catch (err) {
      console.error('[AuthContext] Signup flow failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
      console.groupEnd();
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
