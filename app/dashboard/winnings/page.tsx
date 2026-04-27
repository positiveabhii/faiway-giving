"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { mockUser, mockWinnings } from "@/lib/mockData";
import { Trophy, Upload, CheckCircle2, Clock, ShieldCheck, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function WinningsPage() {
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "success">("idle");

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadState("uploading");
    setTimeout(() => setUploadState("success"), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* SUMMARY */}
      <GlassCard className="p-8 border-gold-500/20 relative overflow-hidden flex flex-col md:flex-row justify-between items-center md:items-start text-center md:text-left">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent"></div>
        <div className="relative z-10 mb-6 md:mb-0">
          <p className="text-gold-400 uppercase tracking-widest text-sm font-bold mb-2 flex items-center justify-center md:justify-start space-x-2">
            <Trophy size={16} />
            <span>Total Lifetime Winnings</span>
          </p>
          <h2 className="text-5xl md:text-6xl font-bold text-white">{mockUser.stats.totalWon}</h2>
        </div>
        
        <div className="relative z-10 bg-charcoal-900/80 p-4 rounded-xl border border-white/5 flex items-center space-x-4">
          <ShieldCheck className="text-emerald-400" size={32} />
          <div className="text-left">
            <p className="text-white font-medium text-sm">Identity Verified</p>
            <p className="text-gray-400 text-xs">Cleared for payouts over $10,000</p>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* HISTORY & TIMELINE */}
        <div>
          <h3 className="text-xl font-bold text-white mb-6">Winnings History</h3>
          <div className="space-y-4">
            {mockWinnings.map((win) => (
              <GlassCard key={win.id} className="p-6 border-white/5">
                <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-4">
                  <div>
                    <h4 className="text-xl font-bold text-white">{win.amount}</h4>
                    <p className="text-gray-400 text-sm">{win.matchType}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 text-xs px-2 py-1 bg-emerald-500/10 rounded uppercase font-bold">{win.status}</span>
                    <p className="text-gray-500 text-xs mt-1">{new Date(win.date).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Timeline inside card for recent wins (mock logic: all show paid) */}
                <div className="relative pt-2">
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-emerald-500/30"></div>
                  <div className="flex justify-between relative z-10">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-charcoal-950 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.5)] mb-2">
                        <CheckCircle2 size={16} />
                      </div>
                      <span className="text-xs text-gray-400">Won</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-charcoal-950 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.5)] mb-2">
                        <CheckCircle2 size={16} />
                      </div>
                      <span className="text-xs text-gray-400">Verified</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-charcoal-950 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.5)] mb-2">
                        <CheckCircle2 size={16} />
                      </div>
                      <span className="text-xs text-emerald-400 font-medium">Paid</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* PROOF UPLOAD UI */}
        <div>
          <h3 className="text-xl font-bold text-white mb-6">Winner Verification</h3>
          <GlassCard className="p-8 border-white/5">
            <div className="mb-6">
              <p className="text-gray-400 text-sm leading-relaxed">
                To process payouts over $1,000, we require a screenshot of your official golf club handicap / scoring app to verify the authenticity of your winning entry.
              </p>
            </div>

            <form onSubmit={handleUpload}>
              <div className="border-2 border-dashed border-white/10 hover:border-gold-500/50 transition-colors rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-charcoal-900/50 mb-6 cursor-pointer relative group">
                <input type="file" required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                
                {uploadState === "idle" && (
                  <>
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-400 mb-4 group-hover:scale-110 group-hover:text-gold-400 transition-all">
                      <Upload size={24} />
                    </div>
                    <p className="text-white font-medium mb-1">Click or drag file to upload</p>
                    <p className="text-gray-500 text-xs">PNG, JPG, or PDF up to 5MB</p>
                  </>
                )}

                {uploadState === "uploading" && (
                  <div className="flex flex-col items-center py-4">
                    <div className="w-12 h-12 border-4 border-white/10 border-t-gold-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-gold-400 text-sm">Uploading securely...</p>
                  </div>
                )}

                {uploadState === "success" && (
                  <div className="flex flex-col items-center py-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                      <CheckCircle2 size={32} />
                    </div>
                    <p className="text-emerald-400 font-medium mb-1">Upload Complete</p>
                    <p className="text-gray-500 text-xs">Under review by admin team</p>
                  </div>
                )}
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start space-x-3 mb-6">
                <Clock className="text-blue-400 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-blue-300 leading-relaxed">
                  Verification typically takes 24-48 hours. Once approved, your payout will be initiated directly to your registered bank account via wire transfer.
                </p>
              </div>

              <Button type="submit" fullWidth disabled={uploadState !== "idle"}>
                Submit Proof
              </Button>
            </form>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
