import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

/**
 * Singleton factory for Supabase Browser Client.
 * Uses globalThis to ensure exactly one instance exists per browser tab,
 * preventing NavigatorLockAcquireTimeoutError from multiple Auth managers.
 */
export function getSupabaseBrowserClient() {
  const global = globalThis as any;

  if (global.__supabase_browser_client__) {
    return global.__supabase_browser_client__;
  }

  console.log('%c[Supabase] 🛡️ CREATING SINGLETON BROWSER CLIENT', 'color: #ec4899; font-weight: bold; font-size: 14px;');

  const client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  global.__supabase_browser_client__ = client;
  return client;
}
