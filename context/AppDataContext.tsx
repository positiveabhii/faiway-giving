"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Subscription, Charity, UserCharitySelection, GolfScore, DrawResult, PrizePool, Winner, PayoutVerification, Notification } from "@/types";

// Import Initial Mock Data
import { mockUsers, mockSubscriptions, mockUserCharities } from "@/lib/data/mock-users";
import { mockCharities } from "@/lib/data/mock-charities";
import { mockScores } from "@/lib/data/mock-scores";
import { mockDraws, mockPrizePools } from "@/lib/data/mock-draws";
import { mockWinnings, mockVerifications } from "@/lib/data/mock-winnings";
import { mockNotifications } from "@/lib/data/mock-notifications";

// Import Engines
import { addScore, deleteScore, editScore } from "@/lib/utils/score-engine";
import { runDrawSimulation, UserDrawEntry } from "@/lib/utils/draw-engine";
import { calculatePayouts } from "@/lib/utils/prize-engine";
import { updateUserCharityContribution } from "@/lib/utils/charity-engine";

interface AppDataContextType {
  // Data
  users: User[];
  subscriptions: Subscription[];
  charities: Charity[];
  userCharitySelections: UserCharitySelection[];
  scores: GolfScore[];
  draws: DrawResult[];
  prizePools: PrizePool[];
  winnings: Winner[];
  verifications: PayoutVerification[];
  notifications: Notification[];

  // Actions - Scores
  submitScore: (score: GolfScore) => void;
  removeScore: (id: string) => void;
  
  // Actions - Draws/Admin
  simulateDraw: (drawId: string, mode: 'random' | 'algorithmic') => any;
  publishDraw: (drawId: string, simulationResult: any) => void;

  // Actions - Verifications
  approveVerification: (id: string, adminId: string) => void;
  rejectVerification: (id: string, adminId: string) => void;
  submitProof: (winnerId: string, proofUrl: string) => void;

  // Actions - Charity
  updateCharityContribution: (userId: string, percentage: number) => void;
  
  // Actions - Notifications
  markNotificationRead: (id: string) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  // State Initialization
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [charities, setCharities] = useState<Charity[]>(mockCharities);
  const [userCharitySelections, setUserCharitySelections] = useState<UserCharitySelection[]>(mockUserCharities);
  const [scores, setScores] = useState<GolfScore[]>(mockScores);
  const [draws, setDraws] = useState<DrawResult[]>(mockDraws);
  const [prizePools, setPrizePools] = useState<PrizePool[]>(mockPrizePools);
  const [winnings, setWinnings] = useState<Winner[]>(mockWinnings);
  const [verifications, setVerifications] = useState<PayoutVerification[]>(mockVerifications);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  // Score Actions
  const submitScore = (score: GolfScore) => {
    setScores(prev => addScore(prev, score));
  };
  
  const removeScore = (id: string) => {
    setScores(prev => deleteScore(prev, id));
  };

  // Draw Actions
  const simulateDraw = (drawId: string, mode: 'random' | 'algorithmic') => {
    // Group active scores by user
    const entriesMap = new Map<string, number[]>();
    scores.forEach(s => {
      if (!entriesMap.has(s.user_id)) entriesMap.set(s.user_id, []);
      entriesMap.get(s.user_id)!.push(s.score_value);
    });

    const entries: UserDrawEntry[] = Array.from(entriesMap.entries())
      .filter(([_, userScores]) => userScores.length >= 5)
      .map(([user_id, userScores]) => ({
        user_id,
        scores: userScores.slice(0, 5) // Use only latest 5
      }));

    return runDrawSimulation(entries, mode);
  };

  const publishDraw = (drawId: string, simulationResult: any) => {
    // Update Draw Status
    setDraws(prev => prev.map(d => 
      d.id === drawId 
        ? { ...d, status: 'completed', lucky_numbers: simulationResult.luckyNumbers, updated_at: new Date().toISOString() } 
        : d
    ));

    const pool = prizePools.find(p => p.draw_id === drawId);
    if (!pool) return;

    // Calculate Payouts
    const { payouts, nextRolloverAmount } = calculatePayouts(pool, simulationResult.winners);

    // Create Winners
    const newWinners: Winner[] = payouts.map(p => ({
      ...p,
      id: `win-${Date.now()}-${Math.random()}`,
      draw_id: drawId,
      payout_status: 'pending',
      proof_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    setWinnings(prev => [...prev, ...newWinners]);
  };

  // Verification Actions
  const submitProof = (winnerId: string, proofUrl: string) => {
    setWinnings(prev => prev.map(w => w.id === winnerId ? { ...w, proof_url: proofUrl, updated_at: new Date().toISOString() } : w));
    
    // Create Verification Record
    const winner = winnings.find(w => w.id === winnerId);
    if(winner) {
      setVerifications(prev => [...prev, {
        id: `verify-${Date.now()}`,
        winner_id: winnerId,
        user_id: winner.user_id,
        admin_id: null,
        status: 'pending',
        notes: null,
        verified_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
    }
  };

  const approveVerification = (id: string, adminId: string) => {
    setVerifications(prev => prev.map(v => 
      v.id === id ? { ...v, status: 'approved', admin_id: adminId, verified_at: new Date().toISOString(), updated_at: new Date().toISOString() } : v
    ));
    // Update winner status
    const verification = verifications.find(v => v.id === id);
    if (verification) {
      setWinnings(prev => prev.map(w => 
        w.id === verification.winner_id ? { ...w, payout_status: 'paid', updated_at: new Date().toISOString() } : w
      ));
    }
  };

  const rejectVerification = (id: string, adminId: string) => {
    setVerifications(prev => prev.map(v => 
      v.id === id ? { ...v, status: 'rejected', admin_id: adminId, verified_at: new Date().toISOString(), updated_at: new Date().toISOString() } : v
    ));
  };

  // Charity Actions
  const updateCharityContribution = (userId: string, percentage: number) => {
    setUserCharitySelections(prev => updateUserCharityContribution(prev, userId, percentage));
  };

  // Notification Actions
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  return (
    <AppDataContext.Provider value={{
      users, subscriptions, charities, userCharitySelections, scores, draws, prizePools, winnings, verifications, notifications,
      submitScore, removeScore, simulateDraw, publishDraw, approveVerification, rejectVerification, submitProof, updateCharityContribution, markNotificationRead
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return context;
}
