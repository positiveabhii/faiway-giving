"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Profile } from "@/types/database";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import * as authService from "@/lib/supabase/services/auth.service";
import * as profileService from "@/lib/supabase/services/profile.service";
import { createSubscription } from "@/lib/supabase/services/prize.service";
import { upsertUserCharitySelection } from "@/lib/supabase/services/charity.service";
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

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const profile = await profileService.getProfile(userId);
      setUser(profile);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        loadProfile(s.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        loadProfile(s.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { session: s } = await authService.signIn(email, password);
      setSession(s);
      if (s?.user) await loadProfile(s.user.id);
      return true;
    } catch {
      return false;
    }
  };

  const signup = async (data: { email: string; password: string; first_name: string; last_name: string; plan: "monthly" | "yearly"; charity_id: string; contribution_percentage: number }): Promise<Profile> => {
    const { user: authUser } = await authService.signUp(data.email, data.password, { first_name: data.first_name, last_name: data.last_name });
    if (!authUser) throw new Error("Signup failed");

    const profile = await authService.createProfileOnSignup(authUser.id, data.email, data.first_name, data.last_name);
    await createSubscription(authUser.id, data.plan);
    if (data.charity_id) {
      await upsertUserCharitySelection(authUser.id, data.charity_id, data.contribution_percentage);
    }
    setUser(profile);
    return profile;
  };

  const logout = async () => {
    await authService.signOut();
    setUser(null);
    setSession(null);
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
