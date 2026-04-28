"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAppData } from "@/context/AppDataContext";
import { Trophy, Clock, Users, ArrowUpRight, Loader2, CheckCircle2 } from "lucide-react";
import { buildTicketsForDraw } from "@/lib/utils/ticket-engine";

export default function DrawsPage() {
  const { draws, winnings, scores, isLoading } = useAppData();

  const upcomingDraw = draws.find(d => d.status === "upcoming");
  const pastDraws = draws.filter(d => d.status === "completed").sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const hallOfFame = winnings.slice(0, 5);

  if (isLoading && draws.length === 0) {
    return (
      <main className="min-h-screen bg-charcoal-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-gold-400" size={40} />
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-charcoal-950 flex flex-col">
      <Navbar />

      <div className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-heading font-bold text-white mb-6">The <span className="gold-gradient-text">Prize Draw</span></h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Where your best scores meet unprecedented rewards. Every month, the pool grows, and lives change.
            </p>
          </div>

          {/* UPCOMING DRAW STATUS */}
          {upcomingDraw ? (
            <div className="space-y-6 mb-20">
              <GlassCard className="p-8 border-gold-500/20 relative overflow-hidden" animate>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between text-center md:text-left">
                  <div className="mb-8 md:mb-0">
                    <p className="text-gold-400 uppercase tracking-widest text-[10px] font-bold mb-2">Next Draw Cycle: {upcomingDraw.month_name}</p>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Current Jackpot</h2>
                    <div className="text-6xl md:text-8xl font-bold gold-gradient-text mb-4">₹{upcomingDraw.total_jackpot.toLocaleString()}</div>
                    <div className="flex items-center justify-center md:justify-start space-x-6 text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Clock size={16} className="text-emerald-400" />
                        <span className="text-sm">{upcomingDraw.countdown_end ? new Date(upcomingDraw.countdown_end).toLocaleDateString() : 'Closing Soon'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users size={16} className="text-gold-400" />
                        <span className="text-sm">{upcomingDraw.total_participants.toLocaleString()} Active Participants</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-1/3 space-y-3">
                    <div className="bg-charcoal-900/80 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                      <div className="text-left">
                        <h4 className="text-white font-medium text-sm">Match 5 Numbers</h4>
                        <p className="text-gray-500 text-xs">Primary Jackpot Pool</p>
                      </div>
                      <span className="text-gold-400 font-bold">100%</span>
                    </div>
                    <div className="bg-charcoal-900/80 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                      <div className="text-left">
                        <h4 className="text-white font-medium text-sm">Match 4 Numbers</h4>
                        <p className="text-gray-500 text-xs">Tier 2 Redistribution</p>
                      </div>
                      <span className="text-white font-bold opacity-60">Split</span>
                    </div>
                    <div className="bg-charcoal-900/80 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                      <div className="text-left">
                        <h4 className="text-white font-medium text-sm">Match 3 Numbers</h4>
                        <p className="text-gray-500 text-xs">Tier 3 Redistribution</p>
                      </div>
                      <span className="text-white font-bold opacity-60">Split</span>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* User Standing Section */}
              {(() => {
                const firstTicket = buildTicketsForDraw(scores, upcomingDraw.id)[0]?.ticket ?? [];
                const isEligible = firstTicket.length >= 5;

                return (
                  <GlassCard className="p-6 border-white/5 bg-charcoal-900/40">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1 flex items-center space-x-2">
                          <Trophy className="text-gold-400" size={18} />
                          <span>Your Competition Standing</span>
                        </h3>
                        <p className="text-gray-500 text-xs">Monthly eligibility is based on your top 5 score submissions.</p>
                      </div>

                      <div className="flex items-center space-x-3">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const score = firstTicket[i];
                          return (
                            <div key={i} className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold border ${score ? 'bg-gold-500/10 border-gold-500/30 text-gold-400' : 'bg-charcoal-950 border-white/5 text-gray-700'}`}>
                              {score ?? '-'}
                            </div>
                          );
                        })}
                      </div>

                      <div className="text-center md:text-right min-w-[120px]">
                        {isEligible ? (
                          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                            <CheckCircle2 size={12} />
                            <span>Eligible</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                            <span>{5 - firstTicket.length} more needed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                );
              })()}
            </div>
          ) : (
            <GlassCard className="mb-20 p-12 text-center border-white/5 border-dashed">
              <p className="text-gray-500">No upcoming draws scheduled at this time.</p>
            </GlassCard>
          )}

          {/* PAST DRAW & WINNERS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                <Trophy className="text-gold-400" />
                <span>Recent Results</span>
              </h3>
              {pastDraws.length > 0 ? (
                <div className="space-y-6">
                  {pastDraws.slice(0, 2).map(pastDraw => (
                    <GlassCard key={pastDraw.id} className="p-6 border-white/5">
                      <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                        <span className="text-white font-medium">{pastDraw.month_name}</span>
                        <span className="text-gray-400 text-sm">{pastDraw.total_participants.toLocaleString()} Entries</span>
                      </div>
                      <div className="mb-6">
                        <p className="text-gray-400 text-sm mb-3">Winning Numbers</p>
                        <div className="flex space-x-3">
                          {pastDraw.lucky_numbers?.map((num, i) => (
                            <div key={i} className="w-12 h-12 rounded-full bg-charcoal-800 border border-gold-500/30 flex items-center justify-center text-gold-400 font-bold text-xl">
                              {num}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Total Payout</p>
                        <p className="text-3xl font-bold text-white">${pastDraw.total_jackpot.toLocaleString()}</p>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic text-center py-8">No past results recorded.</p>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Hall of Fame</h3>
              <div className="space-y-4">
                {hallOfFame.length > 0 ? hallOfFame.map((win) => (
                  <GlassCard key={win.id} className="p-4 border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center">
                        <Trophy className="text-gold-400" size={20} />
                      </div>
                      <div>
                        <p className="text-white font-medium">{win.match_type} Winner</p>
                        <p className="text-gray-400 text-sm">{new Date(win.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-emerald-400">${win.prize_amount.toLocaleString()}</p>
                      <ArrowUpRight className="inline-block text-gray-500 group-hover:text-gold-400 transition-colors" size={16} />
                    </div>
                  </GlassCard>
                )) : (
                  <p className="text-gray-500 italic text-center py-8">Hall of Fame awaiting its first members.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
