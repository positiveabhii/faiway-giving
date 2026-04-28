import { getSupabaseServerClient } from "@/lib/supabase/server";
import { jsonError, jsonOk } from "@/lib/server/api";
import type { AppDataResponse } from "@/types/api";

export const dynamic = "force-dynamic";

const emptyAuthData = {
  scores: [],
  subscriptions: [],
  winnings: [],
  verifications: [],
  notifications: [],
  userCharitySelections: [],
  users: [],
  billingTransactions: [],
} satisfies Omit<AppDataResponse, "charities" | "draws" | "prizePools">;

export async function GET() {
  const supabase = await getSupabaseServerClient();

  const [charitiesResult, drawsResult, poolsResult, userResult] = await Promise.all([
    supabase.from("charities").select("*").order("name"),
    supabase.from("draw_results").select("*").order("created_at", { ascending: false }),
    supabase.from("prize_pools").select("*").order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  if (charitiesResult.error) return jsonError(charitiesResult.error.message, 500);
  if (drawsResult.error) return jsonError(drawsResult.error.message, 500);
  if (poolsResult.error) return jsonError(poolsResult.error.message, 500);

  const publicData = {
    charities: charitiesResult.data ?? [],
    draws: drawsResult.data ?? [],
    prizePools: poolsResult.data ?? [],
  };

  const authUser = userResult.data.user;
  if (!authUser) {
    return jsonOk<AppDataResponse>({ ...publicData, ...emptyAuthData });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();

  if (profileError) return jsonError(profileError.message, 500);
  if (!profile || profile.status !== "active") {
    return jsonOk<AppDataResponse>({ ...publicData, ...emptyAuthData });
  }

  if (profile.role === "admin") {
    const [
      scoresResult,
      subscriptionsResult,
      winningsResult,
      notificationsResult,
      usersResult,
      verificationsResult,
      selectionsResult,
      billingResult,
    ] = await Promise.all([
      supabase.from("golf_scores").select("*").order("played_date", { ascending: false }),
      supabase.from("subscriptions").select("*"),
      supabase.from("draw_winners").select("*").order("created_at", { ascending: false }),
      supabase.from("notifications").select("*").eq("user_id", authUser.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("winner_verifications").select("*").order("created_at", { ascending: false }),
      supabase.from("user_charity_selections").select("*"),
      supabase.from("billing_transactions").select("*").order("billing_date", { ascending: false }),
    ]);

    const error = scoresResult.error ?? subscriptionsResult.error ?? winningsResult.error ?? notificationsResult.error ?? usersResult.error ?? verificationsResult.error ?? selectionsResult.error ?? billingResult.error;
    if (error) return jsonError(error.message, 500);

    return jsonOk<AppDataResponse>({
      ...publicData,
      scores: scoresResult.data ?? [],
      subscriptions: subscriptionsResult.data ?? [],
      winnings: winningsResult.data ?? [],
      notifications: notificationsResult.data ?? [],
      users: usersResult.data ?? [],
      verifications: verificationsResult.data ?? [],
      userCharitySelections: selectionsResult.data ?? [],
      billingTransactions: billingResult.data ?? [],
    });
  }

  const [scoresResult, subscriptionResult, winningsResult, notificationsResult, selectionResult, billingResult] = await Promise.all([
    supabase.from("golf_scores").select("*").eq("user_id", authUser.id).order("played_date", { ascending: false }).limit(5),
    supabase.from("subscriptions").select("*").eq("user_id", authUser.id).maybeSingle(),
    supabase.from("draw_winners").select("*").eq("user_id", authUser.id).order("created_at", { ascending: false }),
    supabase.from("notifications").select("*").eq("user_id", authUser.id).order("created_at", { ascending: false }).limit(50),
    supabase.from("user_charity_selections").select("*").eq("user_id", authUser.id).maybeSingle(),
    supabase.from("billing_transactions").select("*").eq("user_id", authUser.id).order("billing_date", { ascending: false }),
  ]);

  const error = scoresResult.error ?? subscriptionResult.error ?? winningsResult.error ?? notificationsResult.error ?? selectionResult.error ?? billingResult.error;
  if (error) return jsonError(error.message, 500);

  return jsonOk<AppDataResponse>({
    ...publicData,
    scores: scoresResult.data ?? [],
    subscriptions: subscriptionResult.data ? [subscriptionResult.data] : [],
    winnings: winningsResult.data ?? [],
    notifications: notificationsResult.data ?? [],
    userCharitySelections: selectionResult.data ? [selectionResult.data] : [],
    billingTransactions: billingResult.data ?? [],
    users: [],
    verifications: [],
  });
}
