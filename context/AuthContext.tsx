"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Profile } from "@/types/database";
import * as authService from "@/lib/supabase/services/auth.service";
import * as profileService from "@/lib/supabase/services/profile.service";
import { signupSyncUserProfile } from "@/lib/supabase/services/sync.service";

interface AuthContextType {
  session: Session | null;
  user: Profile | null;
  initialized: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: any) => Promise<Profile>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Profile | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const isFirstMount = useRef(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const profile = await profileService.getProfile(userId);
      setUser(profile);
    } catch (err) {
      console.error("[Auth] Profile fetch failed", err);
      setUser(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) {
      await fetchProfile(session.user.id);
    }
  }, [session, fetchProfile]);

  // Bootup: Run exactly once
  useEffect(() => {
    if (!isFirstMount.current) return;
    isFirstMount.current = false;

    const supabase = getSupabaseBrowserClient();

    async function initialize() {
      console.log("[Auth] Starting initialization...");
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        setSession(s);
        if (s?.user) {
          await fetchProfile(s.user.id);
        }
      } catch (err) {
        console.error("[Auth] Bootstrap failed", err);
      } finally {
        setInitialized(true);
        console.log("[Auth] Initialized.");
      }
    }

    initialize();

    // Exactly one listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      console.log(`[Auth] State Change: ${event}`);
      setSession(s);

      if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // Defer hydration to avoid lock contention during callback
        setTimeout(() => {
          if (s?.user) fetchProfile(s.user.id);
        }, 0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { session: s } = await authService.signIn(email, password);
      setSession(s);
      if (s?.user) await fetchProfile(s.user.id);
      return true;
    } catch (err) {
      console.error("[Auth] Login error", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: any) => {
    setLoading(true);
    try {
      const { user: authUser } = await authService.signUp(data.email, data.password, {
        first_name: data.first_name,
        last_name: data.last_name
      });
      if (!authUser) throw new Error("Signup failed");

      const syncResult = await signupSyncUserProfile(authUser.id, data.email, {
        first_name: data.first_name,
        last_name: data.last_name,
        plan: data.plan,
        charity_id: data.charity_id,
        contribution_percentage: data.contribution_percentage
      });

      setUser(syncResult.profile);
      return syncResult.profile;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, initialized, loading, login, signup, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
