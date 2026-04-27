"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { mockDraws, mockWinnings } from "@/lib/mockData";
import { Trophy, Clock, Users, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function DrawsPage() {
  const upcomingDraw = mockDraws.find(d => d.status === "Upcoming");
  const pastDraw = mockDraws.find(d => d.status === "Completed");

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
          {upcomingDraw && (
            <GlassCard className="mb-20 p-8 border-gold-500/20 relative overflow-hidden" animate>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between text-center md:text-left">
                <div className="mb-8 md:mb-0">
                  <p className="text-gold-400 uppercase tracking-widest text-sm font-bold mb-2">Next Draw: {upcomingDraw.month}</p>
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Estimated Jackpot</h2>
                  <div className="text-6xl md:text-8xl font-bold gold-gradient-text mb-4">{upcomingDraw.jackpot}</div>
                  <div className="flex items-center justify-center md:justify-start space-x-4 text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Clock size={18} className="text-emerald-400" />
                      <span>{upcomingDraw.countdown}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users size={18} className="text-gold-400" />
                      <span>{upcomingDraw.participants.toLocaleString()} Entries</span>
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-1/3 space-y-4">
                  <div className="bg-charcoal-900/80 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                    <div>
                      <h4 className="text-white font-medium">Match 5 Numbers</h4>
                      <p className="text-gray-400 text-sm">Grand Jackpot</p>
                    </div>
                    <span className="text-gold-400 font-bold">100%</span>
                  </div>
                  <div className="bg-charcoal-900/80 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                    <div>
                      <h4 className="text-white font-medium">Match 4 Numbers</h4>
                      <p className="text-gray-400 text-sm">Secondary Payout</p>
                    </div>
                    <span className="text-white font-bold">~$50k</span>
                  </div>
                  <div className="bg-charcoal-900/80 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                    <div>
                      <h4 className="text-white font-medium">Match 3 Numbers</h4>
                      <p className="text-gray-400 text-sm">Minor Payout</p>
                    </div>
                    <span className="text-white font-bold">~$5k</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* PAST DRAW & WINNERS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                <Trophy className="text-gold-400" />
                <span>Recent Results</span>
              </h3>
              {pastDraw && (
                <GlassCard className="p-6 border-white/5">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                    <span className="text-white font-medium">{pastDraw.month}</span>
                    <span className="text-gray-400 text-sm">{pastDraw.participants.toLocaleString()} Entries</span>
                  </div>
                  <div className="mb-6">
                    <p className="text-gray-400 text-sm mb-3">Winning Numbers</p>
                    <div className="flex space-x-3">
                      {pastDraw.luckyNumbers.map((num, i) => (
                        <div key={i} className="w-12 h-12 rounded-full bg-charcoal-800 border border-gold-500/30 flex items-center justify-center text-gold-400 font-bold text-xl">
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total Payout</p>
                    <p className="text-3xl font-bold text-white">{pastDraw.jackpot}</p>
                  </div>
                </GlassCard>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Hall of Fame</h3>
              <div className="space-y-4">
                {mockWinnings.map((win) => (
                  <GlassCard key={win.id} className="p-4 border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center">
                        <Trophy className="text-gold-400" size={20} />
                      </div>
                      <div>
                        <p className="text-white font-medium">{win.matchType} Winner</p>
                        <p className="text-gray-400 text-sm">{new Date(win.date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-emerald-400">{win.amount}</p>
                      <ArrowUpRight className="inline-block text-gray-500 group-hover:text-gold-400 transition-colors" size={16} />
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
