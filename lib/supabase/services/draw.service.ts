import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { DrawResult, DrawWinner, PrizePool } from '@/types/database';

const sb = () => getSupabaseBrowserClient();

export async function getAllDraws(): Promise<DrawResult[]> {
  const { data, error } = await sb().from('draw_results').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getUpcomingDraw(): Promise<DrawResult | null> {
  const { data, error } = await sb().from('draw_results').select('*').eq('status', 'upcoming').order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createDraw(monthName: string, countdownEnd: string, totalJackpot: number): Promise<DrawResult> {
  const { data, error } = await sb().from('draw_results').insert({ month_name: monthName, countdown_end: countdownEnd, total_jackpot: totalJackpot }).select().single();
  if (error) throw error;
  return data;
}

export async function publishDrawResult(drawId: string, luckyNumbers: number[], totalParticipants: number): Promise<DrawResult> {
  const { data, error } = await sb().from('draw_results').update({ status: 'completed' as const, lucky_numbers: luckyNumbers, total_participants: totalParticipants }).eq('id', drawId).select().single();
  if (error) throw error;
  return data;
}

export async function createDrawWinners(winners: Array<{ draw_id: string; user_id: string; match_type: '5 Matches' | '4 Matches' | '3 Matches'; prize_amount: number }>): Promise<DrawWinner[]> {
  if (winners.length === 0) return [];
  const { data, error } = await sb().from('draw_winners').insert(winners).select();
  if (error) throw error;
  return data ?? [];
}

export async function getWinnersForDraw(drawId: string): Promise<DrawWinner[]> {
  const { data, error } = await sb().from('draw_winners').select('*').eq('draw_id', drawId);
  if (error) throw error;
  return data ?? [];
}

export async function getWinnersForUser(userId: string): Promise<DrawWinner[]> {
  const { data, error } = await sb().from('draw_winners').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAllWinners(): Promise<DrawWinner[]> {
  const { data, error } = await sb().from('draw_winners').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
