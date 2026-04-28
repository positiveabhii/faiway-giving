"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Calendar, Trash2, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

function ScoresSkeleton() {
  return (
    <div className="space-y-8 animate-pulse max-w-5xl mx-auto">
      <div className="h-64 bg-charcoal-900 rounded-2xl border border-white/5"></div>
      <div className="space-y-4">
        <div className="h-8 w-48 bg-charcoal-900 rounded mx-auto"></div>
        <div className="h-32 bg-charcoal-900 rounded-2xl border border-white/5"></div>
        <div className="h-32 bg-charcoal-900 rounded-2xl border border-white/5"></div>
      </div>
    </div>
  );
}

export default function ScoresPage() {
  const { scores, subscriptions, submitScore, removeScore, isLoading } = useAppData();
  const { user } = useAuth();
  const router = useRouter();
  
  const [newScore, setNewScore] = useState("");
  const [newDate, setNewDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const userScores = scores.filter(s => s.user_id === user?.id).sort((a, b) => new Date(b.played_date).getTime() - new Date(a.played_date).getTime());
  const userSub = subscriptions.find(s => s.user_id === user?.id);
  const isPremium = userSub?.status === 'active';

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPremium) return;
    
    setError("");
    setSuccess("");
    const scoreVal = parseInt(newScore);
    if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 45) { setError("Score must be between 1 and 45."); return; }
    if (!newDate) { setError("Date is required."); return; }

    setSubmitting(true);
    try {
      await submitScore(scoreVal, newDate);
      setSuccess("Score successfully recorded and added to your Draw Ticket.");
      setNewScore("");
      setNewDate("");
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit score.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try { await removeScore(id); } catch { setError("Failed to delete score."); }
  };

  if (isLoading) return <ScoresSkeleton />;

  return (
    <div className="space-y-8 max-w-5xl mx-auto relative">
      {!isPremium && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-charcoal-950/40 rounded-3xl">
          <GlassCard className="max-w-md p-10 text-center border-gold-500/30 shadow-[0_0_50px_rgba(234,179,8,0.15)] animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-gold-500 border border-gold-500/20">
              <AlertCircle size={40} />
            </div>
            <h3 className="text-2xl font-heading font-bold text-white mb-4">Membership Inactive</h3>
            <p className="text-gray-400 mb-8 leading-relaxed">Your membership is currently inactive. You must have an active subscription to record scores and participate in prize draws.</p>
            <Button onClick={() => router.push('/dashboard/profile')} className="w-full py-4 shadow-lg shadow-gold-500/20">
              Activate Membership
            </Button>
            <p className="mt-6 text-xs text-gray-500">Already paid? It may take a moment to sync.</p>
          </GlassCard>
        </div>
      )}

      <GlassCard className={`p-8 border-white/5 transition-all duration-500 ${!isPremium ? 'opacity-20 pointer-events-none grayscale' : ''}`}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Record Performance</h2>
          <p className="text-gray-400 text-sm">Please enter one of your 5 most recent Stableford rounds from the last 6 months.</p>
        </div>
        <form onSubmit={handleAddScore} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date of Round</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Calendar size={18} className="text-gray-500" /></div>
                <input
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  min={new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0]}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-charcoal-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-gold-500/50 [color-scheme:dark]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Stableford Score (1-45)</label>
              <input type="number" min="1" max="45" value={newScore} onChange={(e) => setNewScore(e.target.value)} placeholder="e.g., 36" className="w-full bg-charcoal-900/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500/50" />
            </div>
          </div>
          <AnimatePresence>
            {error && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-400 flex items-center space-x-2 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20"><AlertCircle size={16} /><span>{error}</span></motion.div>)}
            {success && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-emerald-400 flex items-center space-x-2 text-sm bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20"><CheckCircle2 size={16} /><span>{success}</span></motion.div>)}
          </AnimatePresence>
          <Button type="submit" className="w-full md:w-auto" disabled={submitting}>{submitting ? "Submitting..." : "Submit Score to Ticket"}</Button>
        </form>
      </GlassCard>

      <div className={!isPremium ? 'opacity-20 pointer-events-none grayscale' : ''}>
        <h3 className="text-xl font-bold text-white mb-6">Current Draw Ticket (Latest 5 Scores)</h3>

        {userScores.length === 0 ? (
          <GlassCard className="p-12 text-center border-white/5 border-dashed">
            <p className="text-gray-500 mb-2">No scores recorded this month.</p>
            <p className="text-sm text-gray-600">Submit scores above to build your ticket.</p>
          </GlassCard>
        ) : (
          <div className="relative border-l border-white/10 ml-4 md:ml-6 space-y-6 pb-4">
            <AnimatePresence>
              {userScores.map((score, index) => (
                <motion.div key={score.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }} className="relative pl-8 md:pl-10">
                  <div className="absolute -left-1.5 top-5 w-3 h-3 rounded-full bg-gold-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]"></div>
                  <GlassCard className="p-0 overflow-hidden border-white/5 flex flex-col sm:flex-row items-stretch">
                    <div className="bg-charcoal-900/80 p-6 flex-1 flex flex-col justify-center">
                      <p className="text-sm text-gray-500 mb-1">{new Date(score.played_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <div className="flex items-center space-x-3">
                        <span className="text-emerald-400 text-xs px-2 py-1 bg-emerald-500/10 rounded uppercase font-bold">{score.status}</span>
                        {index === 0 && <span className="text-gold-400 text-xs px-2 py-1 bg-gold-500/10 rounded uppercase font-bold">Latest</span>}
                      </div>
                    </div>
                    <div className="bg-charcoal-800/50 p-6 flex items-center justify-between sm:justify-end sm:w-48 sm:border-l border-white/5">
                      <div className="text-center sm:mr-6">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Score</p>
                        <p className="text-3xl font-bold text-white">{score.score_value}</p>
                      </div>
                      <button onClick={() => handleDelete(score.id)} className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Remove Score"><Trash2 size={18} /></button>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
            {userScores.length === 5 && (
              <div className="pl-8 md:pl-10 mt-6"><p className="text-xs text-gold-500 italic">Ticket complete. Any new entry will replace the oldest score.</p></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
