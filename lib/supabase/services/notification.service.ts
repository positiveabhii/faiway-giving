import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Notification } from '@/types/database';

const sb = () => getSupabaseBrowserClient();

export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
  const { data, error } = await sb().from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function markAsRead(notificationId: string): Promise<void> {
  const { error } = await sb().from('notifications').update({ is_read: true }).eq('id', notificationId);
  if (error) throw error;
}

export async function markAllAsRead(userId: string): Promise<void> {
  const { error } = await sb().from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
  if (error) throw error;
}

export async function createNotification(userId: string, title: string, message: string): Promise<Notification> {
  const { data, error } = await sb().from('notifications').insert({ user_id: userId, title, message }).select().single();
  if (error) throw error;
  return data;
}

export async function createBulkNotifications(notifications: Array<{ user_id: string; title: string; message: string }>): Promise<void> {
  if (notifications.length === 0) return;
  const { error } = await sb().from('notifications').insert(notifications);
  if (error) throw error;
}
