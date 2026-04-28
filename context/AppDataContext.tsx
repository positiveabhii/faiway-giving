"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import * as charityService from "@/lib/supabase/services/charity.service";
import * as scoreService from "@/lib/supabase/services/score.service";
import * as drawService from "@/lib/supabase/services/draw.service";
import * as prizeService from "@/lib/supabase/services/prize.service";
import * as notificationService from "@/lib/supabase/services/notification.service";
import * as profileService from "@/lib/supabase/services/profile.service";
import * as winnerService from "@/lib/supabase/services/winner.service";
import { runDrawSimulation, UserDrawEntry } from "@/lib/utils/draw-engine";
import { calculatePayouts } from "@/lib/utils/prize-engine";
import type { Profile, Subscription, Charity, UserCharitySelection, GolfScore, DrawResult, PrizePool, DrawWinner, WinnerVerification, Notification } from "@/types/database";

interface AppDataContextType {
  charities: Charity[];
  scores: GolfScore[];
  draws: DrawResult[];
  prizePools: PrizePool[];
  subscriptions: Subscription[];
  winnings: DrawWinner[];
  verifications: WinnerVerification[];
  notifications: Notification[];
  userCharitySelections: UserCharitySelection[];
  users: Profile[];
  isLoading: boolean;
  error: string | null;
  refreshAll: () => Promise<void>;
  submitScore: (score: number, date: string) => Promise<void>;
  removeScore: (id: string) => Promise<void>;
  updateCharityContribution: (charityId: string, percentage: number) => Promise<void>;
  submitDonation: (charityId: string, amount: number) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  submitProof: (winnerId: string, file: File) => Promise<void>;
  approveVerification: (id: string) => Promise<void>;
  rejectVerification: (id: string) => Promise<void>;
  simulateDraw: (drawId: string, mode: "random" | "algorithmic") => any;
  publishDraw: (drawId: string, result: any) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { session, user, initialized } = useAuth();
  
  const [charities, setCharities] = useState<Charity[]>([]);
  const [scores, setScores] = useState<GolfScore[]>([]);
  const [draws, setDraws] = useState<DrawResult[]>([]);
  const [prizePools, setPrizePools] = useState<PrizePool[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [winnings, setWinnings] = useState<DrawWinner[]>([]);
  const [verifications, setVerifications] = useState<WinnerVerification[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userCharitySelections, setUserCharitySelections] = useState<UserCharitySelection[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = session?.user?.id;
  const userRole = user?.role;

  const fetchData = useCallback(async () => {
    if (!initialized) return;
    setIsLoading(true);
    console.log("[AppData] Passive fetch initiated...");
    try {
      const charData = await charityService.getAllCharities();
      setCharities(charData);

      if (userId) {
        const [scoreData, drawData, poolData, subData, winData, notifData] = await Promise.all([
          userRole === 'admin' ? scoreService.getAllScores() : scoreService.getScoresForUser(userId),
          drawService.getAllDraws(),
          prizeService.getAllPrizePools(),
          prizeService.getAllSubscriptions(),
          userRole === 'admin' ? drawService.getAllWinners() : drawService.getWinnersForUser(userId),
          notificationService.getNotificationsForUser(userId)
        ]);

        setScores(scoreData);
        setDraws(drawData);
        setPrizePools(poolData);
        setSubscriptions(subData);
        setWinnings(winData);
        setNotifications(notifData);

        if (userRole === 'admin') {
          const [profData, verData, selData] = await Promise.all([
            profileService.getAllProfiles(),
            winnerService.getAllVerifications(),
            charityService.getAllUserCharitySelections()
          ]);
          setUsers(profData);
          setVerifications(verData);
          setUserCharitySelections(selData);
        } else {
          const sel = await charityService.getUserCharitySelection(userId);
          setUserCharitySelections(sel ? [sel] : []);
        }
      }
    } catch (err) {
      console.error("[AppData] Fetch failed", err);
      setError("Failed to sync application data.");
    } finally {
      setIsLoading(false);
    }
  }, [initialized, userId, userRole]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshAll = async () => {
    await fetchData();
  };

  const submitScore = async (val: number, date: string) => {
    if (!userId) return;
    await scoreService.addScore(userId, val, date);
    await fetchData();
  };

  const removeScore = async (id: string) => {
    await scoreService.deleteScore(id);
    await fetchData();
  };

  const updateCharityContribution = async (charId: string, pct: number) => {
    if (!userId) return;
    await charityService.upsertUserCharitySelection(userId, charId, pct);
    await fetchData();
  };

  const submitDonation = async (charId: string, amt: number) => {
    if (!userId) throw new Error("Authentication required to donate");
    try {
      await charityService.addDonation(userId, charId, amt);
      await fetchData();
    } catch (err) {
      console.error("[AppData] submitDonation failed:", err);
      throw err;
    }
  };

  const markNotificationRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const submitProof = async (winnerId: string, file: File) => {
    if (!userId) return;
    await winnerService.uploadProof(file, winnerId);
    await winnerService.createVerification(winnerId, userId);
    await fetchData();
  };

  const approveVerification = async (id: string) => {
    if (!userId) return;
    await winnerService.approveVerification(id, userId);
    await fetchData();
  };

  const rejectVerification = async (id: string) => {
    if (!userId) return;
    await winnerService.rejectVerification(id, userId);
    await fetchData();
  };

  const simulateDraw = useCallback((drawId: string, mode: "random" | "algorithmic") => {
    const entriesMap = new Map<string, number[]>();
    scores.forEach((s) => {
      if (!entriesMap.has(s.user_id)) entriesMap.set(s.user_id, []);
      entriesMap.get(s.user_id)!.push(s.score_value);
    });
    const entries: UserDrawEntry[] = Array.from(entriesMap.entries())
      .filter(([, userScores]) => userScores.length >= 5)
      .map(([user_id, userScores]) => ({ user_id, scores: userScores.slice(0, 5) }));
    return runDrawSimulation(entries, mode);
  }, [scores]);

  const publishDraw = async (drawId: string, result: any) => {
    if (!userId) return;
    const pool = prizePools.find((p) => p.draw_id === drawId);
    if (!pool) return;
    await drawService.publishDrawResult(drawId, result.luckyNumbers, scores.length);
    const { payouts } = calculatePayouts(pool, result.winners);
    const rows = payouts.map((p) => ({ draw_id: drawId, user_id: p.user_id, match_type: p.match_type, prize_amount: p.prize_amount }));
    await drawService.createDrawWinners(rows);
    await fetchData();
  };

  return (
    <AppDataContext.Provider value={{
      charities, scores, draws, prizePools, subscriptions, winnings, verifications, notifications, userCharitySelections, users,
      isLoading, error, refreshAll, submitScore, removeScore, updateCharityContribution, submitDonation, markNotificationRead,
      submitProof, approveVerification, rejectVerification, simulateDraw, publishDraw
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) throw new Error("useAppData must be used within AppDataProvider");
  return context;
}
