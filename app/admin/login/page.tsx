"use client";

import React, { useState } from "react";
import { ShieldCheck, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        if (user?.role === "subscriber") {
          router.push("/dashboard");
        } else if (user?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        setError("Invalid admin credentials.");
      }
    } catch {
      setError("Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-charcoal-800 via-charcoal-950 to-charcoal-950 z-0"></div>
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-10">
          <ShieldCheck className="text-gold-500 mx-auto mb-4" size={48} />
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase">Admin Portal</h1>
          <p className="text-gray-500 text-sm mt-2">Authorized personnel only</p>
        </div>
        <form onSubmit={handleLogin} className="bg-charcoal-900 border border-white/10 p-8 rounded-xl shadow-2xl space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-charcoal-950 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-gold-500/50 transition-colors text-sm" placeholder="admin@fairwaygiving.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Access Key</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock size={16} className="text-gray-600" /></div>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-charcoal-950 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-gold-500/50 transition-colors font-mono tracking-widest text-sm" placeholder="••••••••••••" />
            </div>
          </div>
          {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-white text-charcoal-950 font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors uppercase tracking-wider text-sm disabled:opacity-50">
            {loading ? "Authenticating..." : "Authenticate"}
          </button>
        </form>
      </div>
    </div>
  );
}
