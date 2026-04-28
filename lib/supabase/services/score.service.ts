import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { GolfScore } from '@/types/database';

const sb = () => getSupabaseBrowserClient();

export async function getScoresForUser(userId: string): Promise<GolfScore[]> {
  const { data, error } = await sb().from('golf_scores').select('*').eq('user_id', userId).order('played_date', { ascending: false }).limit(5);
  if (error) throw error;
  return data ?? [];
}

export async function getAllScores(): Promise<GolfScore[]> {
  const { data, error } = await sb().from('golf_scores').select('*').order('played_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addScore(userId: string, scoreValue: number, playedDate: string): Promise<GolfScore> {
  // Check duplicate date
  const { data: existing } = await sb().from('golf_scores').select('id').eq('user_id', userId).eq('played_date', playedDate);
  if (existing && existing.length > 0) throw new Error('A score already exists for this date.');

  // Check if user already has 5 scores — delete oldest if so
  const { data: allScores } = await sb().from('golf_scores').select('id, played_date').eq('user_id', userId).order('played_date', { ascending: false });
  if (allScores && allScores.length >= 5) {
    const oldest = allScores[allScores.length - 1];
    await sb().from('golf_scores').delete().eq('id', oldest.id);
  }

  const { data, error } = await sb().from('golf_scores').insert({ user_id: userId, score_value: scoreValue, played_date: playedDate }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteScore(scoreId: string): Promise<void> {
  const { error } = await sb().from('golf_scores').delete().eq('id', scoreId);
  if (error) throw error;
}

export async function updateScore(scoreId: string, updates: { score_value?: number; played_date?: string }): Promise<GolfScore> {
  const { data, error } = await sb().from('golf_scores').update(updates).eq('id', scoreId).select().single();
  if (error) throw error;
  return data;
}
