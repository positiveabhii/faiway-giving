"use client";

import React, { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { Ticket, Settings, Zap, Play, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import type { DrawSimulationResult } from "@/types/domain";

export default function AdminDrawsPage() {
  const { draws, prizePools, scores, simulateDraw, publishDraw, isLoading } = useAppData();
  const [logicMode, setLogicMode] = useState<"random" | "algorithmic">("random");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<DrawSimulationResult | null>(null);
  const [publishStatus, setPublishStatus] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-gold-400" size={32} /></div>;

  const upcomingDraw = draws.find(d => d.status === "upcoming");
  const activePool = upcomingDraw ? prizePools.find(p => p.draw_id === upcomingDraw.id) : null;

  const handleSimulate = () => {
    if (!upcomingDraw) return;
    setIsSimulating(true);
    setSimulationResult(null);
    setPublishStatus("");
    
    // Slight artificial delay for UX
    setTimeout(() => {
      const result = simulateDraw(upcomingDraw.id, logicMode);
      setSimulationResult(result);
      setIsSimulating(false);
    }, 1500);
  };

  const handlePublish = async () => {
    if (!upcomingDraw || !simulationResult) return;
    setIsPublishing(true);
    try {
      await publishDraw(upcomingDraw.id, simulationResult, logicMode);
      setPublishStatus("Result published successfully to all users.");
      setTimeout(() => setPublishStatus(""), 4000);
      setSimulationResult(null);
    } catch (err) {
      setPublishStatus(err instanceof Error ? err.message : "Error publishing result.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Draw Engine Console */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-charcoal-900 border border-white/5 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <Zap className="text-gold-400" size={20} />
              <span>Draw Execution Engine</span>
            </h2>

            {!upcomingDraw ? (
              <div className="text-center py-12 border border-white/5 border-dashed rounded-xl">
                <AlertCircle className="text-gray-600 mx-auto mb-3" size={32} />
                <p className="text-gray-400">No upcoming draws scheduled.</p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <p className="text-sm text-gray-400 mb-3">Generation Logic Protocol</p>
                  <div className="flex space-x-4 bg-charcoal-950 p-1 rounded-lg border border-white/5 w-max">
                    <button 
                      onClick={() => setLogicMode("random")}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${logicMode === 'random' ? 'bg-charcoal-800 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      True Random (RNG)
                    </button>
                    <button 
                      onClick={() => setLogicMode("algorithmic")}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center space-x-2 ${logicMode === 'algorithmic' ? 'bg-charcoal-800 text-white shadow-md border border-gold-500/30 text-gold-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      <Settings size={14} />
                      <span>Algorithmic Weighting</span>
                    </button>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-6">
                  <p className="text-sm text-gray-400 mb-4">Draw Simulation Panel</p>
                  
                  <div className="bg-charcoal-950 rounded-xl border border-white/10 p-8 text-center min-h-[200px] flex flex-col items-center justify-center relative">
                    {isSimulating ? (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-charcoal-800 border-t-gold-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-gold-400 font-mono text-sm tracking-widest">EXECUTING ALGORITHM...</p>
                      </div>
                    ) : simulationResult ? (
                      <div className="flex flex-col items-center w-full">
                        <p className="text-xs text-emerald-400 mb-4 tracking-widest uppercase font-bold">Generated Set</p>
                        <div className="flex justify-center gap-4 mb-8">
                          {simulationResult.luckyNumbers.map((num: number, i: number) => (
                            <div key={i} className="w-14 h-14 rounded-full bg-gold-500/20 border-2 border-gold-500 flex items-center justify-center text-gold-400 font-bold text-xl shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                              {num}
                            </div>
                          ))}
                        </div>
                        
                        <div className="w-full flex justify-between space-x-4">
                          <button onClick={handleSimulate} className="flex-1 bg-charcoal-800 hover:bg-charcoal-700 text-white py-3 rounded-lg text-sm font-bold transition-colors">
                            Re-roll
                          </button>
                          <button onClick={handlePublish} disabled={isPublishing} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-charcoal-950 py-3 rounded-lg text-sm font-bold transition-colors disabled:opacity-60">
                            {isPublishing ? "Publishing..." : "Publish Official Result"}
                          </button>
                        </div>
                        <p className="mt-4 text-xs text-gray-500">Winners found in this simulation: {simulationResult.winners.length}</p>
                      </div>
                    ) : (
                      <button 
                        onClick={handleSimulate}
                        className="flex items-center space-x-2 bg-white hover:bg-gray-200 text-charcoal-950 px-6 py-3 rounded-full font-bold transition-colors"
                      >
                        <Play size={18} fill="currentColor" />
                        <span>Run Generation</span>
                      </button>
                    )}
                    
                    {publishStatus && (
                      <div className="absolute inset-0 bg-charcoal-950/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-xl">
                        <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
                        <p className="text-emerald-400 font-bold">{publishStatus}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Side Info */}
        <div className="space-y-6">
          <div className="bg-charcoal-900 border border-white/5 rounded-xl p-6 relative overflow-hidden">
             <div className="absolute -right-4 -top-4 opacity-10 pointer-events-none">
              <Ticket size={100} />
            </div>
            <h3 className="text-lg font-bold text-white mb-4">Current Pool Stats</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Active Entries</p>
                <p className="text-2xl font-bold text-white">{scores.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Estimated Payout</p>
                <p className="text-2xl font-bold text-gold-400">${activePool?.total_amount.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>

          <div className="bg-charcoal-900 border border-gold-500/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <AlertCircle className="text-gold-400" size={18} />
              <span>Jackpot Rollover Control</span>
            </h3>
            <p className="text-sm text-gray-400 mb-4">If no user matches 5 numbers, the primary pool rolls over to the next month.</p>
            
            <div className="bg-charcoal-950 p-4 rounded-lg border border-white/5 mb-4">
              <p className="text-xs text-gray-500 mb-1">Current Rolled Amount</p>
              <p className="text-lg font-bold text-white">${activePool?.rolled_over_amount.toLocaleString() || '0'}</p>
            </div>
            
            <button className="w-full text-xs font-bold uppercase tracking-wider border border-white/10 hover:bg-white/5 text-gray-300 py-2 rounded transition-colors">
              Force Manual Adjustment
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
