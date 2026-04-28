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
  // 1. Validate Range
  if (scoreValue < 1 || scoreValue > 45) {
    throw new Error('Score must be between 1 and 45.');
  }

  // 2. Validate Date
  const date = new Date(playedDate);
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  if (date > now) {
    throw new Error('Future dates are not allowed.');
  }
  if (date < sixMonthsAgo) {
    throw new Error('Scores older than 6 months are not allowed.');
  }

  // 3. Check duplicate date
  const { data: existing } = await sb()
    .from('golf_scores')
    .select('id')
    .eq('user_id', userId)
    .eq('played_date', playedDate)
    .maybeSingle();
    
  if (existing) {
    throw new Error('A score already exists for this date.');
  }

  // 4. Rolling 5 Logic: If user has 5 scores, delete the oldest one (by played_date)
  const { data: allScores } = await sb()
    .from('golf_scores')
    .select('id, played_date')
    .eq('user_id', userId)
    .order('played_date', { ascending: false });

  if (allScores && allScores.length >= 5) {
    // Oldest is at the end of the sorted list
    const oldest = allScores[allScores.length - 1];
    await sb().from('golf_scores').delete().eq('id', oldest.id);
  }

  const { data, error } = await sb()
    .from('golf_scores')
    .insert({ 
      user_id: userId, 
      score_value: scoreValue, 
      played_date: playedDate,
      status: 'verified' 
    })
    .select()
    .single();
    
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
