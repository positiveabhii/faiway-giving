import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { PrizePool, Subscription } from '@/types/database';

const sb = () => getSupabaseBrowserClient();

export async function getPrizePoolForDraw(drawId: string): Promise<PrizePool | null> {
  const { data, error } = await sb().from('prize_pools').select('*').eq('draw_id', drawId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAllPrizePools(): Promise<PrizePool[]> {
  const { data, error } = await sb().from('prize_pools').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createPrizePool(pool: { draw_id: string; total_amount: number; tier_5_amount: number; tier_4_amount: number; tier_3_amount: number; rolled_over_amount?: number }): Promise<PrizePool> {
  const { data, error } = await sb().from('prize_pools').insert(pool).select().single();
  if (error) throw error;
  return data;
}

export async function updatePrizePool(poolId: string, updates: Partial<PrizePool>): Promise<PrizePool> {
  const { data, error } = await sb().from('prize_pools').update(updates).eq('id', poolId).select().single();
  if (error) throw error;
  return data;
}

export async function getActiveSubscriptionCount(): Promise<number> {
  const { count, error } = await sb().from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active');
  if (error) throw error;
  return count ?? 0;
}

export async function getAllSubscriptions(): Promise<Subscription[]> {
  const { data, error } = await sb().from('subscriptions').select('*');
  if (error) throw error;
  return data ?? [];
}

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const { data, error } = await sb().from('subscriptions').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createSubscription(userId: string, plan: 'monthly' | 'yearly'): Promise<Subscription> {
  const renewalDate = new Date();
  renewalDate.setMonth(renewalDate.getMonth() + (plan === 'yearly' ? 12 : 1));
  const { data, error } = await sb().from('subscriptions').insert({ user_id: userId, plan, next_renewal_date: renewalDate.toISOString() }).select().single();
  if (error) throw error;
  return data;
}

/** Calculate and persist a monthly prize pool. */
export function calculatePrizePoolAmounts(activeCount: number, subscriptionPrice: number, rollover: number = 0) {
  const revenue = activeCount * subscriptionPrice;
  const prizeMoney = revenue * 0.5;
  const total = prizeMoney + rollover;
  return {
    total_amount: total,
    tier_5_amount: total * 0.40,
    tier_4_amount: total * 0.35,
    tier_3_amount: total * 0.25,
    rolled_over_amount: rollover,
  };
}
