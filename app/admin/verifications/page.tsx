"use client";

import React, { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { ShieldAlert, Check, X, Image as ImageIcon, Loader2 } from "lucide-react";

export default function AdminVerificationsPage() {
  const { verifications, users, winnings, approveVerification, rejectVerification, isLoading } = useAppData();
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-gold-400" size={32} /></div>;

  const pendingVerifs = verifications.filter(v => v.status === 'pending');

  return (
    <div className="space-y-6">
      
      <div className="bg-charcoal-900 border border-white/5 rounded-xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-white">Winner Verifications</h2>
            <span className="bg-amber-500/10 text-amber-500 text-xs font-bold px-2 py-1 rounded-full">{pendingVerifs.length} Pending</span>
          </div>
        </div>

        <div className="space-y-4">
          {pendingVerifs.length === 0 ? (
            <div className="text-center py-12 border border-white/5 border-dashed rounded-xl">
              <ShieldAlert className="text-gray-600 mx-auto mb-3" size={32} />
              <p className="text-gray-400">No pending verifications.</p>
            </div>
          ) : (
            pendingVerifs.map((v) => {
              const user = users.find(u => u.id === v.user_id);
              const win = winnings.find(w => w.id === v.winner_id);
              return (
                <div key={v.id} className="bg-charcoal-950 border border-white/5 rounded-xl p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                  
                  {/* User & Win Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <p className="text-white font-bold text-lg">{user?.first_name} {user?.last_name}</p>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-gray-400">Match Record</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs mb-0.5">Match Type</p>
                        <p className="text-white">{win?.match_type}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-0.5">Expected Payout</p>
                        <p className="text-gold-400 font-bold">${Number(win?.prize_amount || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Proof Preview Button */}
                  <div className="w-full lg:w-auto">
                    <button 
                      onClick={() => setSelectedProof(win?.proof_url || null)}
                      className="w-full lg:w-48 h-20 rounded-lg border border-white/10 bg-charcoal-900 hover:bg-white/5 flex flex-col items-center justify-center transition-colors group"
                    >
                      <ImageIcon size={20} className="text-gray-500 group-hover:text-gold-400 mb-1 transition-colors" />
                      <span className="text-xs text-gray-400 font-medium">View Proof Document</span>
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="w-full lg:w-auto flex lg:flex-col gap-2">
                    <button 
                      onClick={() => approveVerification(v.id)}
                      className="flex-1 lg:w-40 flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-charcoal-950 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      <Check size={16} />
                      <span>Approve & Pay</span>
                    </button>
                    <button 
                      onClick={() => rejectVerification(v.id)}
                      className="flex-1 lg:w-40 flex items-center justify-center space-x-2 bg-charcoal-800 hover:bg-red-500/20 text-white hover:text-red-400 border border-white/5 hover:border-red-500/30 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <X size={16} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Proof Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12">
          <div className="absolute inset-0 bg-charcoal-950/90 backdrop-blur-sm" onClick={() => setSelectedProof(null)}></div>
          <div className="bg-charcoal-900 border border-white/10 rounded-xl w-full max-w-4xl max-h-full flex flex-col relative z-10 shadow-2xl">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-white font-bold">Document Verification Viewer</h3>
              <button onClick={() => setSelectedProof(null)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 p-6 bg-charcoal-950 overflow-auto flex items-center justify-center min-h-[400px]">
              <img src={selectedProof} className="max-w-full max-h-full object-contain" alt="Proof" />
            </div>
            <div className="p-4 border-t border-white/5 bg-charcoal-900 flex justify-between items-center">
              <div className="text-xs text-amber-500 flex items-center space-x-1">
                <ShieldAlert size={14} />
                <span>Verify user name, date, and score values match platform records before approval.</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
