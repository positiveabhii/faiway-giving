import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';

const supabase = () => getSupabaseBrowserClient();

export async function signUp(email: string, password: string, meta: { first_name: string; last_name: string }) {
  console.log(`[AuthService] Attempting signup for ${email}`);
  const { data, error } = await supabase().auth.signUp({
    email,
    password,
    options: { 
      data: meta,
      emailRedirectTo: `${window.location.origin}/auth/callback`
    },
  });
  if (error) {
    console.error('[AuthService] Signup error:', error);
    throw error;
  }
  return data;
}

export async function signIn(email: string, password: string) {
  console.log(`[AuthService] Attempting signin for ${email}`);
  const { data, error } = await supabase().auth.signInWithPassword({ email, password });
  if (error) {
    console.error('[AuthService] Signin error:', error);
    throw error;
  }
  return data;
}

export async function signOut() {
  console.log('[AuthService] Signing out');
  const { error } = await supabase().auth.signOut();
  if (error) throw error;
}

export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
  return supabase().auth.onAuthStateChange(callback);
}
