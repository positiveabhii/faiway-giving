"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { Session } from "@supabase/supabase-js";
import { Profile } from "@/types/database";
import { getAuthSession, login as loginApi, logout as logoutApi, signup as signupApi } from "@/lib/api/auth";
import type { SignupRequest } from "@/types/api";

interface AuthContextType {
  session: Session | null;
  user: Profile | null;
  initialized: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupRequest) => Promise<Profile>;
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

  const fetchProfile = useCallback(async () => {
    try {
      const current = await getAuthSession();
      setSession(current.session);
      setUser(current.profile);
    } catch (err) {
      console.error("[Auth] Profile fetch failed", err);
      setUser(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  // Bootup: Run exactly once
  useEffect(() => {
    if (!isFirstMount.current) return;
    isFirstMount.current = false;

    async function initialize() {
      console.log("[Auth] Starting initialization...");
      try {
        const current = await getAuthSession();
        setSession(current.session);
        setUser(current.profile);
      } catch (err) {
        console.error("[Auth] Bootstrap failed", err);
      } finally {
        setInitialized(true);
        console.log("[Auth] Initialized.");
      }
    }

    initialize();
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await loginApi({ email, password });
      setSession(result.session);
      setUser(result.profile);
      return Boolean(result.session);
    } catch (err) {
      console.error("[Auth] Login error", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupRequest) => {
    setLoading(true);
    try {
      const result = await signupApi(data);
      setSession(result.session);
      setUser(result.profile);
      return result.profile;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutApi();
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
