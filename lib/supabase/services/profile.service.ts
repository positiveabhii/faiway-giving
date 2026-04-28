import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';

const sb = () => getSupabaseBrowserClient();

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await sb().from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) {
    console.error(`[ProfileService] Error fetching profile for ${userId}:`, error);
    throw error;
  }
  return data;
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await sb().from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  const { data, error } = await sb().from('profiles').update(updates).eq('id', userId).select().maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Profile not found for update');
  return data;
}

export async function getSubscriberCount(): Promise<number> {
  const { count, error } = await sb().from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'subscriber').eq('status', 'active');
  if (error) throw error;
  return count ?? 0;
}
