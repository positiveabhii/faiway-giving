"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Trophy, Upload, CheckCircle2, Clock, ShieldCheck, Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAppData } from "@/hooks/useAppData";

export default function WinningsPage() {
  const { user } = useAuth();
  const { winnings, verifications, isLoading, submitProof } = useAppData();
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "success">("idle");
  const [selectedWinnerId, setSelectedWinnerId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");

  if (isLoading || !user) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-gold-400" size={32} /></div>;

  const userWinnings = winnings.filter(w => w.user_id === user.id);
  const totalWon = userWinnings.reduce((sum, w) => sum + Number(w.prize_amount), 0);
  const pendingWin = userWinnings.find(w => w.payout_status === "pending" && !w.proof_url);

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    winnerId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file || !winnerId) return;

    setUploadState("uploading");
    setSelectedWinnerId(winnerId);
    setUploadError("");

    try {
      await submitProof(winnerId, file);
      setUploadState("success");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Proof upload failed. Please try again.");
      setUploadState("idle");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <GlassCard className="p-8 border-gold-500/20 relative overflow-hidden flex flex-col md:flex-row justify-between items-center md:items-start text-center md:text-left">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent"></div>
        <div className="relative z-10 mb-6 md:mb-0">
          <p className="text-gold-400 uppercase tracking-widest text-sm font-bold mb-2 flex items-center justify-center md:justify-start space-x-2">
            <Trophy size={16} /><span>Total Lifetime Winnings</span>
          </p>
          <h2 className="text-5xl md:text-6xl font-bold text-white">${totalWon.toLocaleString()}</h2>
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
        <div>
          <h3 className="text-xl font-bold text-white mb-6">Winnings History</h3>
          {userWinnings.length === 0 ? (
            <GlassCard className="p-12 text-center border-white/5 border-dashed">
              <Trophy className="mx-auto text-gray-600 mb-4" size={48} />
              <p className="text-gray-500">No winnings yet. Keep playing!</p>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {userWinnings.map((win) => (
                <GlassCard key={win.id} className="p-6 border-white/5">
                  <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-4">
                    <div>
                      <h4 className="text-xl font-bold text-white">${Number(win.prize_amount).toLocaleString()}</h4>
                      <p className="text-gray-400 text-sm">{win.match_type}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded uppercase font-bold ${win.payout_status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{win.payout_status}</span>
                      <p className="text-gray-500 text-xs mt-1">{new Date(win.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="relative pt-2">
                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-emerald-500/30"></div>
                    <div className="flex justify-between relative z-10">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-charcoal-950 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.5)] mb-2"><CheckCircle2 size={16} /></div>
                        <span className="text-xs text-gray-400">Won</span>
                      </div>
                      {(() => {
                        const verif = verifications.find(v => v.winner_id === win.id);
                        const isApproved = verif?.status === 'approved' || win.payout_status === 'verified' || win.payout_status === 'paid';
                        return (
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${isApproved ? 'bg-emerald-500 text-charcoal-950 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-charcoal-800 text-gray-500 border border-white/10'}`}><CheckCircle2 size={16} /></div>
                            <span className={`text-xs ${isApproved ? 'text-emerald-400 font-medium' : 'text-gray-400'}`}>Verified</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  {win.payout_status === 'pending' && !win.proof_url && (
                    <button onClick={() => {
                      const element = document.getElementById(`verify-${win.id}`);
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }} className="mt-4 w-full text-xs text-gold-400 border border-gold-500/20 rounded-lg py-2 hover:bg-gold-500/10 transition-colors">Complete Verification</button>
                  )}
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xl font-bold text-white mb-6">Winner Verification</h3>
          <GlassCard className="p-8 border-white/5">
            <div className="mb-6">
              <p className="text-gray-400 text-sm leading-relaxed">To process payouts over $1,000, we require a screenshot of your official golf club handicap / scoring app to verify the authenticity of your winning entry.</p>
            </div>

            {userWinnings.filter(w => w.payout_status === 'pending' || w.payout_status === 'verified').map(win => {
              const verif = verifications.find(v => v.winner_id === win.id);
              const hasProof = !!win.proof_url;


              // Deterministic Status Derivation
              const isRejected = verif?.status === 'rejected';
              const isApproved = verif?.status === 'approved' || verif?.status === 'verified';
              const isPending = verif?.status === 'pending';
              const isUploading = uploadState === "uploading" && selectedWinnerId === win.id;

              return (
                <div key={win.id} id={`verify-${win.id}`} className="mb-6 last:mb-0 p-4 rounded-xl bg-charcoal-900/30 border border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-white font-bold">${Number(win.prize_amount).toLocaleString()}</p>
                      <p className="text-gray-500 text-xs">{win.match_type}</p>
                    </div>
                    {isPending && hasProof && (
                      <span className="flex items-center space-x-1 text-amber-400 text-xs font-bold uppercase tracking-wider">
                        <Clock size={12} />
                        <span>Under Review</span>
                      </span>
                    )}
                    {isApproved && (
                      <span className="flex items-center space-x-1 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                        <CheckCircle2 size={12} />
                        <span>Verified</span>
                      </span>
                    )}
                    {isRejected && (
                      <span className="flex items-center space-x-1 text-red-400 text-xs font-bold uppercase tracking-wider">
                        <ShieldAlert size={12} />
                        <span>Rejected</span>
                      </span>
                    )}
                  </div>

                  <div className={`border-2 border-dashed transition-colors rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-charcoal-900/50 cursor-pointer relative group ${isRejected ? 'border-red-500/30 hover:border-red-500/50' : 'border-white/10 hover:border-gold-500/50'}`}>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      onChange={(e) => handleUpload(e, win.id)}
                      disabled={isUploading || isApproved}
                    />

                    {isUploading ? (
                      <div className="flex flex-col items-center py-4">
                        <div className="w-12 h-12 border-4 border-white/10 border-t-gold-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-gold-400 text-sm">Uploading securely...</p>
                      </div>
                    ) : isApproved ? (
                      <div className="flex flex-col items-center py-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4"><ShieldCheck size={32} /></div>
                        <p className="text-emerald-400 font-medium mb-1">Verification Cleared</p>
                        <p className="text-gray-500 text-xs">Payout scheduled</p>
                      </div>
                    ) : isRejected ? (
                      <div className="flex flex-col items-center py-4">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-4"><Upload size={32} /></div>
                        <p className="text-red-400 font-medium mb-1">Proof Rejected</p>
                        <p className="text-gray-500 text-xs mb-3">{verif?.notes || "Please re-upload a clearer document."}</p>
                        <div className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-400 transition-all">Re-upload Proof</div>
                      </div>
                    ) : hasProof ? (
                      <div className="flex flex-col items-center py-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4"><CheckCircle2 size={32} /></div>
                        <p className="text-emerald-400 font-medium mb-1">Proof Submitted</p>
                        <p className="text-gray-500 text-xs mb-3">Verification pending</p>
                        <div className="px-4 py-2 bg-white/5 rounded-lg text-white text-xs font-bold group-hover:bg-gold-500 group-hover:text-charcoal-950 transition-all">Update Proof</div>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-400 mb-4 group-hover:scale-110 group-hover:text-gold-400 transition-all"><Upload size={24} /></div>
                        <p className="text-white font-medium mb-1">Click to upload proof</p>
                        <p className="text-gray-500 text-xs">PNG, JPG, or PDF up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {userWinnings.filter(w => w.payout_status === 'pending' || w.payout_status === 'verified').length === 0 && (
              <div className="text-center py-8">
                <ShieldCheck className="mx-auto text-gray-700 mb-3" size={40} />
                <p className="text-gray-500 text-sm">No pending payouts requiring verification.</p>
              </div>
            )}

            <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start space-x-3">
              <Clock className="text-blue-400 flex-shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-blue-300 leading-relaxed">Verification typically takes 24-48 hours. Once approved, your payout will be initiated directly to your registered bank account via wire transfer.</p>
            </div>
            {uploadError && (
              <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">{uploadError}</div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
