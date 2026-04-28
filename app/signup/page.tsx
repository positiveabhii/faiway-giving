"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Check, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const { session, initialized, signup, loading, user: authUser } = useAuth();
  const { charities } = useAppData();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [charityId, setCharityId] = useState("");
  const [contribution, setContribution] = useState("10");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialized && session) {
      router.replace(authUser?.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [initialized, session, authUser, router]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-gold-400" size={40} />
      </div>
    );
  }

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (step < 3) {
      setStep(step + 1);
    } else {
      try {
        await signup({ email, password, first_name: firstName, last_name: lastName, plan, charity_id: charityId, contribution_percentage: parseInt(contribution) });
        router.push("/dashboard");
      } catch (err: any) {
        setError(err.message || "Signup failed. Please try again.");
      }
    }
  };

  return (
    <main className="min-h-screen bg-charcoal-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent z-0"></div>

      <div className="w-full max-w-2xl relative z-10">
        <Link href="/" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>

        <div className="flex justify-between items-center mb-8 px-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${step >= s ? 'bg-gold-500 text-charcoal-950 scale-110 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-charcoal-900 text-gray-600 border border-white/5'}`}>
                {step > s ? <Check size={18} /> : s}
              </div>
              {s < 3 && <div className={`w-12 sm:w-24 h-[1px] mx-2 sm:mx-4 transition-all duration-500 ${step > s ? 'bg-gold-500' : 'bg-white/10'}`}></div>}
            </div>
          ))}
        </div>

        <GlassCard className="p-8 sm:p-12 border-white/5">
          <form onSubmit={handleNext}>
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-heading font-bold text-white mb-2">Join the Club</h2>
                  <p className="text-gray-400">Select your membership plan to get started</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div
                    onClick={() => setPlan("monthly")}
                    className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 ${plan === "monthly" ? 'bg-gold-500/10 border-gold-500 shadow-lg' : 'bg-charcoal-900/50 border-white/5 hover:border-white/20'}`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-white font-bold">Monthly</span>
                      {plan === "monthly" && <div className="w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center"><Check size={12} className="text-charcoal-950" /></div>}
                    </div>
                    <div className="flex items-baseline mb-2">
                      <span className="text-2xl font-bold text-white">$29</span>
                      <span className="text-gray-400 text-sm ml-1">/mo</span>
                    </div>
                    <p className="text-xs text-gray-500">Billed monthly. Cancel anytime.</p>
                  </div>

                  <div
                    onClick={() => setPlan("yearly")}
                    className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 relative ${plan === "yearly" ? 'bg-gold-500/10 border-gold-500 shadow-lg' : 'bg-charcoal-900/50 border-white/5 hover:border-white/20'}`}
                  >
                    <div className="absolute -top-3 right-4 bg-gold-500 text-charcoal-950 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">Best Value</div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-white font-bold">Annual</span>
                      {plan === "yearly" && <div className="w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center"><Check size={12} className="text-charcoal-950" /></div>}
                    </div>
                    <div className="flex items-baseline mb-2">
                      <span className="text-2xl font-bold text-white">$290</span>
                      <span className="text-gray-400 text-sm ml-1">/yr</span>
                    </div>
                    <p className="text-xs text-gray-500">2 months free. Billed annually.</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-gold-400" />
                    </div>
                    <p className="text-sm text-gray-400">Entry into 4 massive prize draws per month</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-gold-400" />
                    </div>
                    <p className="text-sm text-gray-400">Exclusive access to members-only leaderboard</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-gold-400" />
                    </div>
                    <p className="text-sm text-gray-400">Direct impact on global charities with every game</p>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-heading font-bold text-white mb-2">Support Your Cause</h2>
                  <p className="text-gray-400">Choose a charity to support with your participation</p>
                </div>

                <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {charities.map((charity) => (
                    <div
                      key={charity.id}
                      onClick={() => setCharityId(charity.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex items-center space-x-4 ${charityId === charity.id ? 'bg-gold-500/10 border-gold-500 shadow-md' : 'bg-charcoal-900/30 border-white/5 hover:border-white/20'}`}
                    >
                      <img src={charity?.image_url} alt={charity.name} className="w-12 h-12 rounded-lg object-cover bg-white" />
                      <div className="flex-1">
                        <h4 className="text-white font-bold text-sm">{charity.name}</h4>
                        <p className="text-gray-500 text-[10px] uppercase tracking-widest">{charity.tags}</p>
                      </div>
                      {charityId === charity.id && <div className="w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center"><Check size={12} className="text-charcoal-950" /></div>}
                    </div>
                  ))}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-medium text-gray-300">Donation Percentage</label>
                    <span className="text-gold-400 font-bold">{contribution}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={contribution}
                    onChange={(e) => setContribution(e.target.value)}
                    className="w-full h-1.5 bg-charcoal-800 rounded-lg appearance-none cursor-pointer accent-gold-500"
                  />
                  <p className="text-[10px] text-gray-500 mt-2 italic text-center">Your membership fee is tax-deductible based on this selection.</p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-heading font-bold text-white mb-2">Create Account</h2>
                  <p className="text-gray-400">Finalize your profile details</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-widest">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      className="w-full bg-charcoal-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500/50"
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-widest">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      className="w-full bg-charcoal-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500/50"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-widest">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-charcoal-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500/50"
                    placeholder="jane@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-widest">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-charcoal-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500/50"
                    placeholder="••••••••"
                  />
                  <p className="text-[10px] text-gray-500 mt-2">Must be at least 8 characters with numbers and symbols.</p>
                </div>

                {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}
              </div>
            )}

            <div className="flex justify-between items-center mt-10 space-x-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-4 rounded-xl text-gray-400 hover:text-white font-medium transition-colors border border-white/5 hover:bg-white/5"
                >
                  Back
                </button>
              )}

              <Button
                type="submit"
                fullWidth={step === 1}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 ${step === 2 && !charityId ? 'opacity-50 pointer-events-none' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  <>
                    <span>{step === 3 ? "Complete Membership" : "Continue"}</span>
                    {step < 3 && <ChevronRight size={18} />}
                  </>
                )}
              </Button>
            </div>
          </form>
        </GlassCard>

        <p className="text-center mt-8 text-gray-500 text-sm">
          Already a member?{" "}
          <Link href="/login" className="text-white hover:text-gold-500 transition-colors font-medium">Sign in here</Link>
        </p>
      </div>
    </main>
  );
}
