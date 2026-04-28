"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, session, initialized, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && session) {
      router.replace(user?.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [initialized, session, user, router]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-gold-400" size={40} />
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = await login(email, password);
    if (!success) {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-charcoal-950 flex flex-col md:flex-row relative">
      <div className="hidden md:flex w-1/2 relative bg-charcoal-900 overflow-hidden flex-col justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-gold-500/20 via-transparent to-transparent"></div>
        <div className="relative z-10 max-w-md mx-auto">
          <Link href="/" className="inline-block mb-12">
            <span className="text-3xl font-heading font-bold text-white tracking-wide">
              Fairway<span className="gold-gradient-text">Giving</span>
            </span>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">Welcome back to the club.</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Access your premium dashboard, track your scores, and view the latest multi-million dollar prize draws.
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md relative">
          <Link href="/" className="absolute -top-16 left-0 text-gray-400 hover:text-white flex items-center space-x-2 transition-colors">
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>

          <GlassCard className="p-8 sm:p-10 border-white/5">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white mb-2">Sign In</h2>
              <p className="text-gray-400">Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-charcoal-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">Password</label>
                  <Link href="/forgot-password" className="text-xs text-gold-400 hover:text-gold-300">Forgot Password?</Link>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-charcoal-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded">{error}</p>}

              <Button type="submit" fullWidth className="mt-8" disabled={loading}>
                {loading ? <RefreshCw className="animate-spin" size={18} /> : "Sign In to Dashboard"}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-white font-medium hover:text-gold-400 transition-colors">
                  Apply for Membership
                </Link>
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
