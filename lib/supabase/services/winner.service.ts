import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { WinnerVerification } from '@/types/database';

const sb = () => getSupabaseBrowserClient();

export async function getAllVerifications(): Promise<WinnerVerification[]> {
  const { data, error } = await sb().from('winner_verifications').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPendingVerifications(): Promise<WinnerVerification[]> {
  const { data, error } = await sb().from('winner_verifications').select('*').eq('status', 'pending').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createVerification(winnerId: string, userId: string): Promise<WinnerVerification> {
  const { data, error } = await sb().from('winner_verifications').insert({ winner_id: winnerId, user_id: userId }).select().single();
  if (error) throw error;
  return data;
}

export async function approveVerification(verificationId: string, adminId: string): Promise<WinnerVerification> {
  const { data, error } = await sb().from('winner_verifications').update({ status: 'approved' as const, admin_id: adminId, verified_at: new Date().toISOString() }).eq('id', verificationId).select().single();
  if (error) throw error;
  // Also update winner payout_status to 'verified'
  const verification = data;
  await sb().from('draw_winners').update({ payout_status: 'verified' as const }).eq('id', verification.winner_id);
  return data;
}

export async function rejectVerification(verificationId: string, adminId: string, notes?: string): Promise<WinnerVerification> {
  const { data, error } = await sb().from('winner_verifications').update({ status: 'rejected' as const, admin_id: adminId, notes: notes ?? null, verified_at: new Date().toISOString() }).eq('id', verificationId).select().single();
  if (error) throw error;
  return data;
}

export async function markPayoutPaid(winnerId: string): Promise<void> {
  const { error } = await sb().from('draw_winners').update({ payout_status: 'paid' as const }).eq('id', winnerId);
  if (error) throw error;
}

export async function uploadProof(file: File, winnerId: string): Promise<string> {
  const path = `proofs/${winnerId}/${Date.now()}_${file.name}`;
  const { error } = await sb().storage.from('winner-proofs').upload(path, file);
  if (error) throw error;
  const { data } = sb().storage.from('winner-proofs').getPublicUrl(path);
  // Update the winner record
  await sb().from('draw_winners').update({ proof_url: data.publicUrl }).eq('id', winnerId);
  return data.publicUrl;
}
