import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';

const supabase = () => getSupabaseBrowserClient();

export async function signUp(email: string, password: string, meta: { first_name: string; last_name: string }) {
  const { data, error } = await supabase().auth.signUp({
    email,
    password,
    options: { data: meta },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase().auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session }, error } = await supabase().auth.getSession();
  if (error) throw error;
  return session;
}

export async function createProfileOnSignup(
  userId: string,
  email: string,
  firstName: string,
  lastName: string,
  role: 'admin' | 'subscriber' = 'subscriber'
): Promise<Profile> {
  const { data, error } = await supabase()
    .from('profiles')
    .insert({ id: userId, email, first_name: firstName, last_name: lastName, role })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
  return supabase().auth.onAuthStateChange(callback);
}
