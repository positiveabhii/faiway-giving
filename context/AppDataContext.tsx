"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { getAppData } from "@/lib/api/app-data";
import * as scoreApi from "@/lib/api/scores";
import * as donationApi from "@/lib/api/donations";
import * as charitySelectionApi from "@/lib/api/charity-selection";
import * as drawApi from "@/lib/api/draw";
import * as winnerApi from "@/lib/api/winners";
import * as notificationApi from "@/lib/api/notifications";
import type { Profile, Subscription, Charity, UserCharitySelection, CharityDonation, GolfScore, DrawResult, PrizePool, DrawWinner, WinnerVerification, Notification, BillingTransaction } from "@/types/database";
import type { DrawMode, DrawSimulationResult } from "@/types/domain";

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
  charityDonations: CharityDonation[];
  users: Profile[];
  billingTransactions: BillingTransaction[];
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
  simulateDraw: (drawId: string, mode: DrawMode, luckyNumbers?: number[]) => Promise<DrawSimulationResult>;
  publishDraw: (drawId: string, result: DrawSimulationResult, mode?: DrawMode) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { session, initialized } = useAuth();

  const [charities, setCharities] = useState<Charity[]>([]);
  const [scores, setScores] = useState<GolfScore[]>([]);
  const [draws, setDraws] = useState<DrawResult[]>([]);
  const [prizePools, setPrizePools] = useState<PrizePool[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [winnings, setWinnings] = useState<DrawWinner[]>([]);
  const [verifications, setVerifications] = useState<WinnerVerification[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userCharitySelections, setUserCharitySelections] = useState<UserCharitySelection[]>([]);
  const [charityDonations, setCharityDonations] = useState<CharityDonation[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [billingTransactions, setBillingTransactions] = useState<BillingTransaction[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = session?.user?.id;

  const fetchData = useCallback(async () => {
    if (!initialized) return;
    setIsLoading(true);
    console.log("[AppData] Passive fetch initiated...");
    try {
      // 1. Public Data (Always fetch)
      const data = await getAppData();
      setCharities(data.charities);
      setDraws(data.draws);
      setPrizePools(data.prizePools);
      setScores(data.scores);
      setSubscriptions(data.subscriptions);
      setWinnings(data.winnings);
      setNotifications(data.notifications);
      setUsers(data.users);
      setVerifications(data.verifications);
      setCharityDonations(data.charityDonations);
      setUserCharitySelections(data.userCharitySelections);
      setBillingTransactions(data.billingTransactions);
    } catch (err) {
      console.error("[AppData] Fetch failed", err);
      setError("Failed to sync application data.");
    } finally {
      setIsLoading(false);
    }
  }, [initialized]);

  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, [fetchData]);

  const refreshAll = async () => {
    await fetchData();
  };

  const submitScore = async (val: number, date: string) => {
    if (!userId) return;
    await scoreApi.createScore({ score_value: val, played_date: date });
    await fetchData();
  };

  const removeScore = async (id: string) => {
    await scoreApi.deleteScore({ score_id: id });
    await fetchData();
  };

  const updateCharityContribution = async (charId: string, pct: number) => {
    if (!userId) return;
    await charitySelectionApi.updateCharitySelection({ charity_id: charId, contribution_percentage: pct });
    await fetchData();
  };

  const submitDonation = async (charId: string, amt: number) => {
    if (!userId) throw new Error("Authentication required to donate");
    try {
      await donationApi.createDonation({ charity_id: charId, amount: amt });
      await fetchData();
    } catch (err) {
      console.error("[AppData] submitDonation failed:", err);
      throw err;
    }
  };

  const markNotificationRead = async (id: string) => {
    await notificationApi.markNotificationRead({ notification_id: id });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const submitProof = async (winnerId: string, file: File) => {
    if (!userId) return;
    await winnerApi.submitWinnerProof(winnerId, file);
    await fetchData();
  };

  const approveVerification = async (id: string) => {
    if (!userId) return;
    await winnerApi.approveWinnerVerification(id);
    await fetchData();
  };

  const rejectVerification = async (id: string) => {
    if (!userId) return;
    await winnerApi.rejectWinnerVerification(id);
    await fetchData();
  };

  const simulateDraw = useCallback((drawId: string, mode: DrawMode, luckyNumbers?: number[]) => {
    return drawApi.simulateDraw({
      draw_id: drawId, mode, lucky_numbers:
        luckyNumbers
    });
  }, []);

  const publishDraw = async (drawId: string, _result: DrawSimulationResult, mode: DrawMode = "random") => {
    if (!userId) return;
    await drawApi.executeDraw({ draw_id: drawId, mode });
    await fetchData();
  };

  return (
    <AppDataContext.Provider value={{
      charities, scores, draws, prizePools, subscriptions, winnings, verifications, notifications, userCharitySelections, charityDonations, users, billingTransactions,
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
