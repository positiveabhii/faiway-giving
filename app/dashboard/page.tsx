"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Trophy, Clock, Heart, Edit3, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useAppData } from "@/hooks/useAppData";

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2 h-64 bg-charcoal-900 rounded-2xl border border-white/5"></div>
        <div className="h-64 bg-charcoal-900 rounded-2xl border border-white/5"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-48 bg-charcoal-900 rounded-2xl border border-white/5"></div>
        <div className="h-48 bg-charcoal-900 rounded-2xl border border-white/5"></div>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const { user } = useAuth();
  const { draws, subscriptions, winnings, charities, userCharitySelections, scores, isLoading } = useAppData();

  // Root authentication check - this is the only hard block
  if (!user) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-gold-400" size={32} /></div>;
  }

  // If bootstrap is still happening, show skeleton
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const upcomingDraw = draws.find(d => d.status === "upcoming");
  const userSub = subscriptions.find(s => s.user_id === user.id);
  const userSelection = userCharitySelections.find(s => s.user_id === user.id);
  const selectedCharity = userSelection ? charities.find(c => c.id === userSelection.charity_id) : null;
  const totalWon = winnings.filter(w => w.user_id === user.id).reduce((sum, w) => sum + Number(w.prize_amount), 0);
  const totalEntries = scores.length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard className="col-span-1 lg:col-span-2 p-8 border-gold-500/20 relative overflow-hidden flex flex-col justify-center min-h-[250px]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-heading font-bold text-white mb-2">Welcome back, {user.first_name}</h2>
            <p className="text-gray-400 mb-8 max-w-md">Your 5 best scores this month are currently securing your place in the upcoming multi-million dollar draw.</p>

            <div className="flex space-x-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Entries</p>
                <p className="text-3xl font-bold text-white">{totalEntries}</p>
              </div>
              <div className="w-px bg-white/10"></div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Winnings</p>
                <p className="text-3xl font-bold text-emerald-400">${totalWon.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-8 border-white/5 flex flex-col justify-between items-center text-center">
          {upcomingDraw ? (
            <div>
              <p className="text-gold-400 uppercase tracking-widest text-xs font-bold mb-2">Next Draw</p>
              <h3 className="text-3xl font-bold text-white mb-2">${upcomingDraw.total_jackpot.toLocaleString()}</h3>
              <p className="text-gray-400 text-sm mb-6 flex items-center justify-center space-x-2">
                <Clock size={14} className="text-emerald-400" />
                <span>{upcomingDraw.countdown_end ? new Date(upcomingDraw.countdown_end).toLocaleDateString() : "TBD"}</span>
              </p>
            </div>
          ) : (
            <div className="text-gray-500 italic">No upcoming draws</div>
          )}
          <Link href="/dashboard/scores" className="w-full mt-auto">
            <button className="w-full bg-charcoal-800 hover:bg-charcoal-700 text-white py-3 rounded-xl transition-colors text-sm font-medium border border-white/10 flex justify-center items-center space-x-2">
              <Edit3 size={16} /><span>Enter New Score</span>
            </button>
          </Link>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <GlassCard className="p-6 border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Trophy className="text-gold-400" size={20} /><span>Membership Status</span>
            </h3>
            <Link href="/dashboard/profile" className="text-sm text-gray-500 hover:text-white flex items-center space-x-1">
              <span>Manage</span><ArrowRight size={14} />
            </Link>
          </div>

          <>
            <div className="bg-charcoal-900/50 rounded-xl p-4 border border-white/5 mb-4 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500 mb-1">Current Plan</p>
                <p className="text-white font-medium capitalize">{userSub?.plan ?? "No Plan"} {userSub?.plan === "yearly" ? "Yearly" : ""}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <p className="text-emerald-400 font-medium text-sm px-2 py-0.5 bg-emerald-500/10 rounded-full inline-block capitalize">{userSub?.status ?? "N/A"}</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">Renews on {userSub ? new Date(userSub.next_renewal_date).toLocaleDateString() : "—"}</p>
          </>
        </GlassCard>

        <GlassCard className="p-6 border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Heart className="text-emerald-400" size={20} /><span>Charity Impact</span>
            </h3>
            <Link href="/dashboard/charity" className="text-sm text-gray-500 hover:text-white flex items-center space-x-1">
              <span>View</span><ArrowRight size={14} />
            </Link>
          </div>

          {selectedCharity ? (
            <>
              <div className="flex items-center space-x-4 mb-6">
                <img src={selectedCharity.image_url} alt={selectedCharity.name} className="w-16 h-16 rounded-lg object-cover" />
                <div>
                  <p className="text-white font-medium">{selectedCharity.name}</p>
                  <p className="text-sm text-gray-400">Total Raised: <span className="text-emerald-400 font-medium">${selectedCharity.total_raised.toLocaleString()}</span></p>
                </div>
              </div>
              <div className="bg-charcoal-900/50 rounded-xl p-4 border border-white/5 flex justify-between items-center">
                <p className="text-sm text-gray-300">Winning Contribution</p>
                <span className="text-emerald-400 font-bold">{userSelection?.contribution_percentage ?? 0}%</span>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-sm">No charity selected yet. <Link href="/dashboard/charity" className="text-gold-400 hover:underline">Choose one</Link></p>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
