import { Notification } from '@/types';

export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    user_id: "user-1",
    title: "Score Accepted",
    message: "Your score of 32 on Apr 20 was accepted.",
    is_read: false,
    created_at: "2026-04-20T12:00:00Z",
  },
  {
    id: "notif-2",
    user_id: "user-1",
    title: "Draw Upcoming",
    message: "April Draw is happening in 4 days!",
    is_read: true,
    created_at: "2026-04-18T10:00:00Z",
  },
  {
    id: "notif-3",
    user_id: "user-1",
    title: "Charity Milestone",
    message: "Your selected charity reached $1M in funding.",
    is_read: true,
    created_at: "2026-04-15T10:00:00Z",
  }
];
