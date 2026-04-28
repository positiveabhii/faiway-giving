import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Profile, Subscription, UserCharitySelection } from '@/types/database';
import { createSubscription, getUserSubscription } from './prize.service';
import { upsertUserCharitySelection, getUserCharitySelection } from './charity.service';
import { getProfile } from './profile.service';

const sb = () => getSupabaseBrowserClient();

interface SyncResult {
  profile: Profile;
  subscription: Subscription | null;
  charitySelection: UserCharitySelection | null;
}

/**
 * Centralized helper to guarantee synchronization between auth user and application tables.
 * Used during signup and for self-healing missing profile records.
 */
export async function signupSyncUserProfile(
  userId: string,
  email: string,
  metadata: { first_name: string; last_name: string; plan?: 'monthly' | 'yearly'; charity_id?: string; contribution_percentage?: number },
  role: 'subscriber' | 'admin' = 'subscriber'
): Promise<SyncResult> {
  console.group(`[AuthSync] FULL SYNC: ${userId}`);
  console.time("full_sync_duration");
  
  try {
    // 1. Ensure Profile exists
    console.log('[AuthSync] Step 1: Checking/Creating Profile...');
    let profile = await getProfile(userId);
    
    if (!profile) {
      console.warn(`[AuthSync] Profile missing for ${userId}. Creating now...`);
      const { data, error } = await sb()
        .from('profiles')
        .insert({
          id: userId,
          email,
          first_name: metadata.first_name,
          last_name: metadata.last_name,
          role,
          status: 'active'
        })
        .select()
        .single();
        
      if (error) {
        console.error('[AuthSync] Profile creation SQL error:', error);
        throw new Error(`Critical: Profile synchronization failed - ${error.message} (Code: ${error.code})`);
      }
      profile = data;
      console.log('[AuthSync] Profile created successfully:', profile);
    } else {
      console.log('[AuthSync] Profile already exists');
    }

    // 2. Ensure Subscription exists (only for subscribers)
    let subscription: Subscription | null = null;
    if (role === 'subscriber') {
      console.log('[AuthSync] Step 2: Checking/Creating Subscription...');
      subscription = await getUserSubscription(userId);
      
      if (!subscription && metadata.plan) {
        console.warn(`[AuthSync] Subscription missing for ${userId}. Creating ${metadata.plan} plan...`);
        subscription = await createSubscription(userId, metadata.plan);
        console.log('[AuthSync] Subscription created successfully');
      } else if (!subscription) {
        console.warn('[AuthSync] No plan provided and no subscription found. Skipping subscription creation.');
      } else {
        console.log('[AuthSync] Subscription already exists');
      }
    }

    // 3. Ensure Charity Selection exists (only if charity_id provided)
    let charitySelection: UserCharitySelection | null = null;
    if (metadata.charity_id) {
      console.log('[AuthSync] Step 3: Checking/Creating Charity Selection...');
      charitySelection = await getUserCharitySelection(userId);
      
      if (!charitySelection) {
        console.warn(`[AuthSync] Charity selection missing for ${userId}. Creating...`);
        charitySelection = await upsertUserCharitySelection(
          userId, 
          metadata.charity_id, 
          metadata.contribution_percentage || 50
        );
        console.log('[AuthSync] Charity selection created successfully');
      } else {
        console.log('[AuthSync] Charity selection already exists');
      }
    }

    console.log('[AuthSync] Full synchronization complete');
    return { profile, subscription, charitySelection };
  } catch (error) {
    console.error('[AuthSync] FATAL synchronization error:', error);
    throw error;
  } finally {
    console.timeEnd("full_sync_duration");
    console.groupEnd();
  }
}

/**
 * Lightweight repair function to create a minimal profile if it's missing during login.
 * This avoids the overhead of checking subscriptions/charities during a standard login flow.
 */
export async function repairMissingProfile(
  userId: string,
  email: string,
  metadata: { first_name: string; last_name: string },
  role: 'subscriber' | 'admin' = 'subscriber'
): Promise<Profile> {
  console.group(`[AuthSync] REPAIR: ${userId}`);
  console.time("repair_duration");
  
  try {
    console.log('[AuthSync] Attempting minimal profile creation...');
    const { data, error } = await sb()
      .from('profiles')
      .insert({
        id: userId,
        email,
        first_name: metadata.first_name || 'User',
        last_name: metadata.last_name || '',
        role,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('[AuthSync] Repair SQL error:', error);
      throw new Error(`Profile repair failed: ${error.message}`);
    }

    console.log('[AuthSync] Profile repaired successfully:', data);
    return data;
  } finally {
    console.timeEnd("repair_duration");
    console.groupEnd();
  }
}
