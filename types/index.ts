export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  role: 'admin' | 'subscriber';
  status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'monthly' | 'yearly';
  status: 'active' | 'canceled' | 'past_due';
  next_renewal_date: string;
  created_at: string;
  updated_at: string;
}

export interface Charity {
  id: string;
  name: string;
  mission: string;
  image_url: string;
  tags: string[];
  is_spotlight: boolean;
  total_raised: number;
  upcoming_events: number;
  created_at: string;
  updated_at: string;
}

export interface UserCharitySelection {
  id: string;
  user_id: string;
  charity_id: string;
  contribution_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface GolfScore {
  id: string;
  user_id: string;
  score_value: number; // 1-45
  played_date: string;
  status: 'entered' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface DrawResult {
  id: string;
  month_name: string; // e.g., "April 2026"
  status: 'upcoming' | 'completed';
  countdown_end: string | null;
  lucky_numbers: number[] | null;
  total_jackpot: number;
  total_participants: number;
  created_at: string;
  updated_at: string;
}

export interface PrizePool {
  id: string;
  draw_id: string;
  total_amount: number;
  tier_5_amount: number; // 40%
  tier_4_amount: number; // 35%
  tier_3_amount: number; // 25%
  rolled_over_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Winner {
  id: string;
  draw_id: string;
  user_id: string;
  match_type: '5 Matches' | '4 Matches' | '3 Matches';
  prize_amount: number;
  payout_status: 'pending' | 'verified' | 'paid';
  proof_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayoutVerification {
  id: string;
  winner_id: string;
  user_id: string;
  admin_id: string | null;
  status: 'pending' | 'approved' | 'rejected';
  notes: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
