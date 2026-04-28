"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Check, ChevronRight } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [charityId, setCharityId] = useState("");
  const [contribution, setContribution] = useState("10");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { charities } = useAppData();
  const { signup } = useAuth();
  const router = useRouter();

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (step < 3) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        await signup({ email, password, first_name: firstName, last_name: lastName, plan, charity_id: charityId, contribution_percentage: parseInt(contribution) });
        router.push("/dashboard");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <main className="min-h-screen bg-charcoal-950 flex flex-col md:flex-row relative">
      <div className="hidden md:flex w-1/3 relative bg-charcoal-900 overflow-hidden flex-col justify-between p-12 border-r border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent"></div>
        <div className="relative z-10">
          <Link href="/" className="inline-block mb-16">
            <span className="text-3xl font-heading font-bold text-white tracking-wide">
              Fairway<span className="gold-gradient-text">Giving</span>
            </span>
          </Link>
          <div className="space-y-8">
            <div className={`transition-opacity duration-300 ${step >= 1 ? 'opacity-100' : 'opacity-40'}`}>
              <h3 className="text-white font-bold mb-1">1. Select Membership</h3>
              <p className="text-gray-400 text-sm">Choose your commitment level.</p>
            </div>
            <div className={`transition-opacity duration-300 ${step >= 2 ? 'opacity-100' : 'opacity-40'}`}>
              <h3 className="text-white font-bold mb-1">2. Choose Charity Impact</h3>
              <p className="text-gray-400 text-sm">Direct your automated contributions.</p>
            </div>
            <div className={`transition-opacity duration-300 ${step >= 3 ? 'opacity-100' : 'opacity-40'}`}>
              <h3 className="text-white font-bold mb-1">3. Personal Details</h3>
              <p className="text-gray-400 text-sm">Finalize your premium account.</p>
            </div>
          </div>
        </div>
        <div className="relative z-10">
          <GlassCard className="p-6 border-white/5 bg-black/20">
            <p className="text-gray-300 italic text-sm">&quot;Joining this platform revolutionized my game. I play with purpose knowing I&apos;m making a difference, and the potential payouts are unmatched.&quot;</p>
            <p className="text-gold-400 text-xs font-bold mt-4 uppercase tracking-wider">— Marcus T., Premium Member</p>
          </GlassCard>
        </div>
      </div>

      <div className="w-full md:w-2/3 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-xl relative">
          {step === 1 && (
            <Link href="/" className="absolute -top-12 left-0 text-gray-400 hover:text-white flex items-center space-x-2 transition-colors">
              <ArrowLeft size={16} /><span>Back to Home</span>
            </Link>
          )}
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="absolute -top-12 left-0 text-gray-400 hover:text-white flex items-center space-x-2 transition-colors">
              <ArrowLeft size={16} /><span>Back</span>
            </button>
          )}

          <GlassCard className="p-8 sm:p-10 border-white/5">
            <form onSubmit={handleNext}>
              {step === 1 && (
                <div className="space-y-6">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Membership Tier</h2>
                    <p className="text-gray-400">Select the plan that matches your ambition.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div onClick={() => setPlan("monthly")} className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 ${plan === 'monthly' ? 'border-gold-500 bg-gold-500/10' : 'border-white/10 bg-charcoal-900/50 hover:border-white/30'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-white font-bold text-lg">Monthly</h3>
                        {plan === 'monthly' && <Check className="text-gold-400" size={20} />}
                      </div>
                      <div className="text-3xl font-bold text-white mb-2">$49<span className="text-sm font-normal text-gray-400">/mo</span></div>
                      <p className="text-gray-400 text-sm">Flexible entry. Cancel anytime.</p>
                    </div>
                    <div onClick={() => setPlan("yearly")} className={`cursor-pointer p-6 rounded-xl border-2 relative overflow-hidden transition-all duration-300 ${plan === 'yearly' ? 'border-gold-500 bg-gold-500/10' : 'border-white/10 bg-charcoal-900/50 hover:border-white/30'}`}>
                      <div className="absolute top-0 right-0 bg-gold-500 text-charcoal-950 text-[10px] font-bold px-2 py-1 uppercase rounded-bl-lg">Best Value</div>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-white font-bold text-lg">Annually</h3>
                        {plan === 'yearly' && <Check className="text-gold-400" size={20} />}
                      </div>
                      <div className="text-3xl font-bold text-white mb-2">$490<span className="text-sm font-normal text-gray-400">/yr</span></div>
                      <p className="text-gray-400 text-sm">Save $98. Premium concierge.</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Charitable Impact</h2>
                    <p className="text-gray-400">Choose where your automated donations are directed.</p>
                  </div>
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-2 hide-scrollbar">
                    {charities.map(charity => (
                      <div key={charity.id} onClick={() => setCharityId(charity.id)} className={`cursor-pointer p-4 rounded-xl border transition-all duration-300 flex items-center space-x-4 ${charityId === charity.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-charcoal-900/50 hover:border-white/30'}`}>
                        <img src={charity.image_url} alt={charity.name} className="w-16 h-16 rounded-lg object-cover" />
                        <div className="flex-1">
                          <h4 className="text-white font-bold">{charity.name}</h4>
                          <p className="text-gray-400 text-xs line-clamp-1">{charity.mission}</p>
                        </div>
                        {charityId === charity.id && <Check className="text-emerald-400 flex-shrink-0" size={20} />}
                      </div>
                    ))}
                  </div>
                  {charityId && (
                    <div className="pt-4 border-t border-white/10 mt-6">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Percentage of Winnings Donated</label>
                      <p className="text-xs text-gray-500 mb-4">On top of your base entry allocation, you can opt to donate a percentage of any jackpot you win directly to this charity.</p>
                      <input type="range" min="0" max="50" step="5" value={contribution} onChange={(e) => setContribution(e.target.value)} className="w-full accent-emerald-500" />
                      <div className="text-center mt-2 text-emerald-400 font-bold">{contribution}%</div>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Final Details</h2>
                    <p className="text-gray-400">Create your secure login.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                      <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required className="w-full bg-charcoal-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                      <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required className="w-full bg-charcoal-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500/50" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-charcoal-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full bg-charcoal-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500/50" />
                  </div>
                  {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded">{error}</p>}
                </div>
              )}

              <Button type="submit" fullWidth className="mt-8 flex items-center justify-center space-x-2" disabled={(step === 2 && !charityId) || loading}>
                <span>{loading ? "Processing..." : step === 3 ? "Complete Membership" : "Continue"}</span>
                {step < 3 && !loading && <ChevronRight size={18} />}
              </Button>
            </form>
            {step === 1 && (
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  Already a member?{" "}
                  <Link href="/login" className="text-white font-medium hover:text-gold-400 transition-colors">Sign In</Link>
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
