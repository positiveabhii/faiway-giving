"use client";

import React, { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { Ticket, Settings, Zap, Play, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import type { DrawSimulationResult } from "@/types/domain";
import { buildTicketsForDraw } from "@/lib/utils/ticket-engine";

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

  const eligibleEntriesCount = upcomingDraw ? buildTicketsForDraw(scores, upcomingDraw.id).length : 0;

  const handleSimulate = () => {
    if (!upcomingDraw) return;
    setIsSimulating(true);
    setSimulationResult(null);
    setPublishStatus("");

    setTimeout(async () => {
      try {
        const result = await simulateDraw(upcomingDraw.id, logicMode);
        // console.log(result)
        setSimulationResult(result);
      } catch (err) {
        setPublishStatus(err instanceof Error ? err.message : "Error simulating draw.");
      }
      setIsSimulating(false);
    }, 1000);
  };

  const handlePublish = async () => {
    if (!upcomingDraw || !simulationResult) return;
    setIsPublishing(true);
    try {
      await publishDraw(upcomingDraw.id, simulationResult!, logicMode);
      setPublishStatus("Draw executed successfully. Winners notified.");
      setTimeout(() => setPublishStatus(""), 4000);
      setSimulationResult(null);
    } catch (err) {
      setPublishStatus(err instanceof Error ? err.message : "Error executing draw.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Monthly Draw Engine</h1>
          <p className="text-gray-400 text-sm">Control center for authoritative monthly competition lifecycle.</p>
        </div>
        {upcomingDraw && (
          <div className="bg-gold-500/10 border border-gold-500/20 px-4 py-2 rounded-lg">
            <span className="text-gold-400 font-bold text-sm">ACTIVE CYCLE: {upcomingDraw.month_name}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Draw Engine Console */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-charcoal-900 border border-white/5 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <Zap className="text-gold-400" size={20} />
              <span>Execution Control</span>
            </h2>

            {!upcomingDraw ? (
              <div className="text-center py-12 border border-white/5 border-dashed rounded-xl">
                <AlertCircle className="text-gray-600 mx-auto mb-3" size={32} />
                <p className="text-gray-400">No active draw cycle found. System will auto-generate one on next interaction.</p>
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
                      <span>Seed-Based Hash</span>
                    </button>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-6">
                  <p className="text-sm text-gray-400 mb-4">Live Simulation Preview</p>

                  <div className="bg-charcoal-950 rounded-xl border border-white/10 p-8 text-center min-h-[240px] flex flex-col items-center justify-center relative overflow-hidden">
                    {isSimulating ? (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-charcoal-800 border-t-gold-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-gold-400 font-mono text-sm tracking-widest">CALCULATING PROBABILITIES...</p>
                      </div>
                    ) : simulationResult ? (
                      <div className="flex flex-col items-center w-full animate-in fade-in zoom-in duration-300">
                        <p className="text-[10px] text-emerald-400 mb-4 tracking-[0.3em] uppercase font-bold">PREVIEW DRAW NUMBERS</p>
                        <div className="flex justify-center gap-3 mb-8">
                          {simulationResult.luckyNumbers.map((num: number, i: number) => (
                            <div key={i} className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/50 flex items-center justify-center text-gold-400 font-bold text-lg shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                              {num}
                            </div>
                          ))}
                        </div>

                        <div className="w-full flex flex-col sm:flex-row justify-center gap-3 max-w-md">
                          <button onClick={handleSimulate} className="flex-1 bg-charcoal-800 hover:bg-charcoal-700 text-white py-3 rounded-lg text-xs font-bold transition-colors">
                            RE-SIMULATE
                          </button>
                          <button onClick={handlePublish} disabled={isPublishing} className="flex-2 bg-emerald-500 hover:bg-emerald-400 text-charcoal-950 px-8 py-3 rounded-lg text-xs font-bold transition-colors disabled:opacity-60">
                            {isPublishing ? "EXECUTING DRAW..." : "COMMIT & EXECUTE DRAW"}
                          </button>
                        </div>
                        <div className="mt-6 flex items-center space-x-6 text-[10px] text-gray-500 uppercase tracking-wider">
                          <span>Winners Found: <b className="text-white">{simulationResult.winners.length}</b></span>
                          <span>Simulation Mode: <b className="text-white">{logicMode}</b></span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Play className="text-gold-500 mb-4 opacity-20" size={48} />
                        <button
                          onClick={handleSimulate}
                          className="flex items-center space-x-2 bg-white hover:bg-gray-200 text-charcoal-950 px-8 py-3 rounded-full font-bold transition-all hover:scale-105 active:scale-95"
                        >
                          <Zap size={18} fill="currentColor" />
                          <span>RUN SIMULATION</span>
                        </button>
                        <p className="mt-4 text-xs text-gray-500">Preview the draw before committing official results to the blockchain.</p>
                      </div>
                    )}

                    {publishStatus && (
                      <div className="absolute inset-0 bg-charcoal-950/95 backdrop-blur-md z-20 flex flex-col items-center justify-center rounded-xl animate-in fade-in duration-500">
                        <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mb-4">
                          <CheckCircle2 size={32} className="text-emerald-500" />
                        </div>
                        <p className="text-white font-bold text-lg mb-2">{publishStatus}</p>
                        <p className="text-gray-500 text-xs">All winner records, notifications, and donations have been processed.</p>
                        <button onClick={() => setPublishStatus("")} className="mt-6 text-gold-400 text-xs font-bold hover:underline">CLOSE CONSOLE</button>
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
            <h3 className="text-lg font-bold text-white mb-6">Real-Time Cycle Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-charcoal-950 p-4 rounded-lg border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Participants</p>
                <p className="text-xl font-bold text-white">{upcomingDraw?.total_participants || 0}</p>
              </div>
              <div className="bg-charcoal-950 p-4 rounded-lg border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Eligible Entries</p>
                <p className="text-xl font-bold text-emerald-400">{eligibleEntriesCount}</p>
              </div>
              <div className="col-span-2 bg-charcoal-950 p-4 rounded-lg border border-gold-500/20">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Current Jackpot Pool</p>
                <p className="text-2xl font-bold text-gold-400">₹{(upcomingDraw?.total_jackpot || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-charcoal-900 border border-gold-500/20 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
              <AlertCircle className="text-gold-400" size={16} />
              <span>Automatic Rollover Engine</span>
            </h3>
            <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
              System is configured to rollover the <b>Tier 5 (Jackpot)</b> amount to the following month if no user achieves 5 matches.
            </p>

            <div className="bg-charcoal-950 p-4 rounded-lg border border-white/5 mb-4">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Incoming Rollover</p>
              <p className="text-lg font-bold text-white">₹{(activePool?.rolled_over_amount || 0).toLocaleString()}</p>
            </div>

            <button className="w-full text-[10px] font-bold uppercase tracking-widest border border-white/10 hover:bg-white/5 text-gray-400 py-3 rounded-lg transition-colors">
              SYSTEM OVERRIDE
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
