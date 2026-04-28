"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Profile, Subscription, Charity, UserCharitySelection, GolfScore, DrawResult, PrizePool, DrawWinner, WinnerVerification, Notification } from "@/types/database";
import { useAuth } from "./AuthContext";

import * as profileService from "@/lib/supabase/services/profile.service";
import * as scoreService from "@/lib/supabase/services/score.service";
import * as charityService from "@/lib/supabase/services/charity.service";
import * as drawService from "@/lib/supabase/services/draw.service";
import * as prizeService from "@/lib/supabase/services/prize.service";
import * as winnerService from "@/lib/supabase/services/winner.service";
import * as notificationService from "@/lib/supabase/services/notification.service";

import { runDrawSimulation, UserDrawEntry } from "@/lib/utils/draw-engine";
import { calculatePayouts } from "@/lib/utils/prize-engine";

interface AppDataContextType {
  users: Profile[];
  subscriptions: Subscription[];
  charities: Charity[];
  userCharitySelections: UserCharitySelection[];
  scores: GolfScore[];
  draws: DrawResult[];
  prizePools: PrizePool[];
  winnings: DrawWinner[];
  verifications: WinnerVerification[];
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;

  submitScore: (scoreValue: number, playedDate: string) => Promise<void>;
  removeScore: (id: string) => Promise<void>;
  simulateDraw: (drawId: string, mode: "random" | "algorithmic") => ReturnType<typeof runDrawSimulation>;
  publishDraw: (drawId: string, simulationResult: ReturnType<typeof runDrawSimulation>) => Promise<void>;
  approveVerification: (id: string) => Promise<void>;
  rejectVerification: (id: string) => Promise<void>;
  submitProof: (winnerId: string, file: File) => Promise<void>;
  updateCharityContribution: (charityId: string, percentage: number) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [users, setUsers] = useState<Profile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [userCharitySelections, setUserCharitySelections] = useState<UserCharitySelection[]>([]);
  const [scores, setScores] = useState<GolfScore[]>([]);
  const [draws, setDraws] = useState<DrawResult[]>([]);
  const [prizePools, setPrizePools] = useState<PrizePool[]>([]);
  const [winnings, setWinnings] = useState<DrawWinner[]>([]);
  const [verifications, setVerifications] = useState<WinnerVerification[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }
    setIsLoading(true);
    setError(null);
    try {
      const [charData, drawData, poolData, subData] = await Promise.all([
        charityService.getAllCharities(),
        drawService.getAllDraws(),
        prizeService.getAllPrizePools(),
        prizeService.getAllSubscriptions(),
      ]);
      setCharities(charData);
      setDraws(drawData);
      setPrizePools(poolData);
      setSubscriptions(subData);

      if (user.role === "admin") {
        const [allUsers, allScores, allWinners, allVerifs, allSelections] = await Promise.all([
          profileService.getAllProfiles(),
          scoreService.getAllScores(),
          drawService.getAllWinners(),
          winnerService.getAllVerifications(),
          charityService.getAllUserCharitySelections(),
        ]);
        setUsers(allUsers);
        setScores(allScores);
        setWinnings(allWinners);
        setVerifications(allVerifs);
        setUserCharitySelections(allSelections);
      } else {
        const [userScores, userWinners, userNotifs, userSelection] = await Promise.all([
          scoreService.getScoresForUser(user.id),
          drawService.getWinnersForUser(user.id),
          notificationService.getNotificationsForUser(user.id),
          charityService.getUserCharitySelection(user.id),
        ]);
        setScores(userScores);
        setWinnings(userWinners);
        setNotifications(userNotifs);
        setUserCharitySelections(userSelection ? [userSelection] : []);
        setUsers([user]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const submitScore = async (scoreValue: number, playedDate: string) => {
    if (!user) return;
    await scoreService.addScore(user.id, scoreValue, playedDate);
    await notificationService.createNotification(user.id, "Score Recorded", `Your score of ${scoreValue} on ${playedDate} was recorded.`);
    const updated = await scoreService.getScoresForUser(user.id);
    setScores(updated);
    const notifs = await notificationService.getNotificationsForUser(user.id);
    setNotifications(notifs);
  };

  const removeScore = async (id: string) => {
    await scoreService.deleteScore(id);
    if (user) {
      const updated = await scoreService.getScoresForUser(user.id);
      setScores(updated);
    }
  };

  const simulateDraw = (drawId: string, mode: "random" | "algorithmic") => {
    const entriesMap = new Map<string, number[]>();
    scores.forEach((s) => {
      if (!entriesMap.has(s.user_id)) entriesMap.set(s.user_id, []);
      entriesMap.get(s.user_id)!.push(s.score_value);
    });
    const entries: UserDrawEntry[] = Array.from(entriesMap.entries())
      .filter(([, userScores]) => userScores.length >= 5)
      .map(([user_id, userScores]) => ({ user_id, scores: userScores.slice(0, 5) }));
    return runDrawSimulation(entries, mode);
  };

  const publishDraw = async (drawId: string, simulationResult: ReturnType<typeof runDrawSimulation>) => {
    if (!user) return;
    const pool = prizePools.find((p) => p.draw_id === drawId);
    if (!pool) return;

    await drawService.publishDrawResult(drawId, simulationResult.luckyNumbers, scores.length);
    const { payouts } = calculatePayouts(pool, simulationResult.winners);
    const winnerRows = payouts.map((p) => ({ draw_id: drawId, user_id: p.user_id, match_type: p.match_type, prize_amount: p.prize_amount }));
    await drawService.createDrawWinners(winnerRows);

    // Notify winners
    for (const w of winnerRows) {
      await notificationService.createNotification(w.user_id, "🎉 You Won!", `You matched ${w.match_type} and won $${w.prize_amount.toLocaleString()}!`);
    }

    await fetchAll();
  };

  const approveVerification = async (id: string) => {
    if (!user) return;
    await winnerService.approveVerification(id, user.id);
    const v = verifications.find((x) => x.id === id);
    if (v) await notificationService.createNotification(v.user_id, "Verification Approved", "Your winner proof has been approved.");
    await fetchAll();
  };

  const rejectVerification = async (id: string) => {
    if (!user) return;
    await winnerService.rejectVerification(id, user.id);
    await fetchAll();
  };

  const submitProof = async (winnerId: string, file: File) => {
    if (!user) return;
    await winnerService.uploadProof(file, winnerId);
    await winnerService.createVerification(winnerId, user.id);
    await fetchAll();
  };

  const updateCharityContribution = async (charityId: string, percentage: number) => {
    if (!user) return;
    await charityService.upsertUserCharitySelection(user.id, charityId, percentage);
    const sel = await charityService.getUserCharitySelection(user.id);
    setUserCharitySelections(sel ? [sel] : []);
  };

  const markNotificationRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  return (
    <AppDataContext.Provider
      value={{
        users, subscriptions, charities, userCharitySelections, scores, draws, prizePools, winnings, verifications, notifications,
        isLoading, error,
        submitScore, removeScore, simulateDraw, publishDraw, approveVerification, rejectVerification, submitProof, updateCharityContribution, markNotificationRead, refreshAll: fetchAll,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) throw new Error("useAppData must be used within an AppDataProvider");
  return context;
}
