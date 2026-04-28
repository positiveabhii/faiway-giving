import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Charity, UserCharitySelection } from '@/types/database';

const sb = () => getSupabaseBrowserClient();

export async function getAllCharities(): Promise<Charity[]> {
  const { data, error } = await sb().from('charities').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function getCharity(id: string): Promise<Charity | null> {
  const { data, error } = await sb().from('charities').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createCharity(charity: { name: string; mission: string; image_url: string; tags?: string[]; is_spotlight?: boolean }): Promise<Charity> {
  const { data, error } = await sb().from('charities').insert(charity).select().single();
  if (error) throw error;
  return data;
}

export async function updateCharity(id: string, updates: Partial<Charity>): Promise<Charity> {
  const { data, error } = await sb().from('charities').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCharity(id: string): Promise<void> {
  const { error } = await sb().from('charities').delete().eq('id', id);
  if (error) throw error;
}

export async function getUserCharitySelection(userId: string): Promise<UserCharitySelection | null> {
  const { data, error } = await sb().from('user_charity_selections').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAllUserCharitySelections(): Promise<UserCharitySelection[]> {
  const { data, error } = await sb().from('user_charity_selections').select('*');
  if (error) throw error;
  return data ?? [];
}

export async function upsertUserCharitySelection(userId: string, charityId: string, contributionPercentage: number): Promise<UserCharitySelection> {
  const { data, error } = await sb().from('user_charity_selections').upsert({ user_id: userId, charity_id: charityId, contribution_percentage: contributionPercentage }, { onConflict: 'user_id' }).select().single();
  if (error) throw error;
  return data;
}

export async function addDonation(userId: string, charityId: string, amount: number) {
  const { data, error } = await sb()
    .from('charity_donations')
    .insert({ user_id: userId, charity_id: charityId, amount })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadCharityMedia(file: File, fileName: string): Promise<string> {
  const path = `charity-images/${Date.now()}_${fileName}`;
  const { error } = await sb().storage.from('charity-media').upload(path, file);
  if (error) throw error;
  const { data } = sb().storage.from('charity-media').getPublicUrl(path);
  return data.publicUrl;
}
