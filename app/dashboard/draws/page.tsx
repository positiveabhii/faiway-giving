"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Ticket, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { buildUserTicketForDraw } from "@/lib/utils/ticket-engine";

export default function DashboardDrawsPage() {
  const { draws, scores, subscriptions, isLoading } = useAppData();
  const { user } = useAuth();
  const router = useRouter();

  if (isLoading || !user) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-gold-400" size={32} /></div>;

  const userSub = subscriptions.find(s => s.user_id === user.id);
  const isPremium = userSub?.status === 'active';

  const upcomingDraw = draws.find(d => d.status === "upcoming");
  const pastDraw = draws.find(d => d.status === "completed");

  const userNumbers = upcomingDraw ? buildUserTicketForDraw(scores, user.id, upcomingDraw.id) : [];
  const isTicketComplete = userNumbers.length === 5;

  return (
    <div className="space-y-8 max-w-5xl mx-auto relative">
      {!isPremium && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-charcoal-950/40 rounded-3xl">
          <GlassCard className="max-w-md p-10 text-center border-gold-500/30 shadow-[0_0_50px_rgba(234,179,8,0.15)] animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-gold-500 border border-gold-500/20">
              <Ticket size={40} />
            </div>
            <h3 className="text-2xl font-heading font-bold text-white mb-4">Join the Draw</h3>
            <p className="text-gray-400 mb-8 leading-relaxed">Active membership is required to participate in prize draws. Unlock your ticket by activating your subscription.</p>
            <Button onClick={() => router.push('/dashboard/profile')} className="w-full py-4 shadow-lg shadow-gold-500/20">
              Unlock Participation
            </Button>
          </GlassCard>
        </div>
      )}

      <div className={`space-y-8 transition-all duration-500 ${!isPremium ? 'opacity-20 pointer-events-none grayscale' : ''}`}>
        {upcomingDraw && (
          <GlassCard className="p-0 overflow-hidden border-gold-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)]">
            <div className="bg-gradient-to-r from-charcoal-900 via-charcoal-800 to-charcoal-900 p-8 border-b border-white/5 relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><Ticket size={120} /></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <p className="text-gold-400 font-bold uppercase tracking-widest text-sm mb-2">{upcomingDraw.month_name} Draw</p>
                  <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">Your Active Ticket</h2>
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <Clock size={16} className="text-emerald-400" />
                    <span>Draws on {upcomingDraw.countdown_end ? new Date(upcomingDraw.countdown_end).toLocaleDateString() : "TBD"}</span>
                  </div>
                </div>
                <div className="mt-6 md:mt-0 text-left md:text-right">
                  <p className="text-sm text-gray-400 mb-1">Estimated Jackpot</p>
                  <p className="text-3xl font-bold gold-gradient-text">${upcomingDraw.total_jackpot.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="p-8 bg-charcoal-950 flex flex-col items-center">
              <p className="text-gray-400 text-sm mb-6 text-center">Your numbers are generated from your top 5 recorded scores.</p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {[0, 1, 2, 3, 4].map(index => {
                  const num = userNumbers[index];
                  return (
                    <div key={index} className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-2xl font-bold border-2 transition-all duration-500 ${num ? 'border-gold-500 bg-gold-500/10 text-white shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'border-white/10 bg-charcoal-900 text-gray-600 border-dashed'}`}>
                      {num || '?'}
                    </div>
                  );
                })}
              </div>
              {!isTicketComplete && (
                <div className="flex items-center space-x-2 text-amber-500 bg-amber-500/10 px-4 py-2 rounded-lg text-sm border border-amber-500/20">
                  <AlertCircle size={16} /><span>Ticket incomplete. You need {5 - userNumbers.length} more scores to qualify.</span>
                </div>
              )}
              {isTicketComplete && (
                <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-lg text-sm border border-emerald-500/20">
                  <CheckCircle2 size={16} /><span>Ticket successfully locked for the upcoming draw.</span>
                </div>
              )}
            </div>
          </GlassCard>
        )}

        {pastDraw && (
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Previous Draw Result</h3>
            <GlassCard className="p-0 overflow-hidden border-white/5">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-charcoal-900/50">
                <span className="text-white font-medium">{pastDraw.month_name}</span>
                <span className="text-emerald-400 text-sm font-medium px-3 py-1 bg-emerald-500/10 rounded-full">Completed</span>
              </div>
              <div className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
                <div className="flex-1 text-center md:text-left">
                  <p className="text-sm text-gray-500 uppercase tracking-widest mb-4">Official Winning Numbers</p>
                  <div className="flex justify-center md:justify-start gap-3 mb-6">
                    {(pastDraw.lucky_numbers ?? []).map((num, i) => (
                      <div key={i} className="w-12 h-12 rounded-full border border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-lg">{num}</div>
                    ))}
                  </div>
                </div>
                <div className="w-full md:w-64 space-y-3">
                  <div className="bg-charcoal-900 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Total Payout</span>
                    <span className="text-white font-bold">${pastDraw.total_jackpot.toLocaleString()}</span>
                  </div>
                  <div className="bg-charcoal-900 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Participants</span>
                    <span className="text-white font-bold">{pastDraw.total_participants.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {!upcomingDraw && !pastDraw && (
          <GlassCard className="p-12 text-center border-white/5 border-dashed">
            <Ticket className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-500">No draws available yet. Check back soon!</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
