"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { getSessionUser, setSessionUser, clearSession } from "@/lib/utils/auth-engine";
import { mockUsers } from "@/lib/data/mock-users";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, is_admin?: boolean) => Promise<boolean>;
  signup: (userData: Partial<User>) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage on mount
    const storedUser = getSessionUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, is_admin: boolean = false): Promise<boolean> => {
    // Mock login logic
    const foundUser = mockUsers.find(u => u.email === email && (is_admin ? u.role === 'admin' : u.role === 'subscriber'));
    
    if (foundUser) {
      setUser(foundUser);
      setSessionUser(foundUser);
      return true;
    }
    
    // For mock testing, if user not found but testing admin
    if (is_admin && email === "admin@fairwaygiving.com") {
        const adminUser = mockUsers.find(u => u.role === 'admin')!;
        setUser(adminUser);
        setSessionUser(adminUser);
        return true;
    }
    // For mock testing subscriber
    if (!is_admin && email === "alexander.s@example.com") {
        const subUser = mockUsers.find(u => u.id === 'user-1')!;
        setUser(subUser);
        setSessionUser(subUser);
        return true;
    }

    return false;
  };

  const signup = async (userData: Partial<User>): Promise<User> => {
    // Mock signup logic
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email || "",
      first_name: userData.first_name || "",
      last_name: userData.last_name || "",
      role: "subscriber",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setUser(newUser);
    setSessionUser(newUser);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
