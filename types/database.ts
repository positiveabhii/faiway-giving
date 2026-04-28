export type UserRole = 'admin' | 'subscriber';
export type UserStatus = 'active' | 'suspended';
export type SubscriptionPlan = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due';
export type ScoreStatus = 'entered' | 'verified' | 'rejected';
export type DrawStatus = 'upcoming' | 'completed';
export type PayoutStatus = 'pending' | 'verified' | 'paid';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type MatchType = '5 Matches' | '4 Matches' | '3 Matches';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; email: string; first_name: string; last_name: string; avatar_url: string | null; role: UserRole; status: UserStatus; created_at: string; updated_at: string };
        Insert: { id: string; email: string; first_name: string; last_name: string; avatar_url?: string | null; role?: UserRole; status?: UserStatus; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      subscriptions: {
        Row: { id: string; user_id: string; plan: SubscriptionPlan; status: SubscriptionStatus; next_renewal_date: string; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; plan: SubscriptionPlan; status?: SubscriptionStatus; next_renewal_date: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
        Relationships: [];
      };
      charities: {
        Row: { id: string; name: string; mission: string; image_url: string; tags: string[]; is_spotlight: boolean; total_raised: number; upcoming_events: number; created_at: string; updated_at: string };
        Insert: { id?: string; name: string; mission: string; image_url: string; tags?: string[]; is_spotlight?: boolean; total_raised?: number; upcoming_events?: number; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['charities']['Insert']>;
        Relationships: [];
      };
      charity_donations: {
        Row: { id: string; user_id: string; charity_id: string; amount: number; created_at: string };
        Insert: { id?: string; user_id: string; charity_id: string; amount: number; created_at?: string };
        Update: Partial<Database['public']['Tables']['charity_donations']['Insert']>;
        Relationships: [];
      };
      user_charity_selections: {
        Row: { id: string; user_id: string; charity_id: string; contribution_percentage: number; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; charity_id: string; contribution_percentage?: number; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['user_charity_selections']['Insert']>;
        Relationships: [];
      };
      golf_scores: {
        Row: { id: string; user_id: string; score_value: number; played_date: string; status: ScoreStatus; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; score_value: number; played_date: string; status?: ScoreStatus; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['golf_scores']['Insert']>;
        Relationships: [];
      };
      draw_results: {
        Row: { id: string; month_name: string; status: DrawStatus; countdown_end: string | null; lucky_numbers: number[] | null; total_jackpot: number; total_participants: number; created_at: string; updated_at: string };
        Insert: { id?: string; month_name: string; status?: DrawStatus; countdown_end?: string | null; lucky_numbers?: number[] | null; total_jackpot?: number; total_participants?: number; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['draw_results']['Insert']>;
        Relationships: [];
      };
      draw_winners: {
        Row: { id: string; draw_id: string; user_id: string; match_type: MatchType; prize_amount: number; payout_status: PayoutStatus; proof_url: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; draw_id: string; user_id: string; match_type: MatchType; prize_amount: number; payout_status?: PayoutStatus; proof_url?: string | null; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['draw_winners']['Insert']>;
        Relationships: [];
      };
      winner_verifications: {
        Row: { id: string; winner_id: string; user_id: string; admin_id: string | null; status: VerificationStatus; notes: string | null; verified_at: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; winner_id: string; user_id: string; admin_id?: string | null; status?: VerificationStatus; notes?: string | null; verified_at?: string | null; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['winner_verifications']['Insert']>;
        Relationships: [];
      };
      notifications: {
        Row: { id: string; user_id: string; title: string; message: string; is_read: boolean; created_at: string };
        Insert: { id?: string; user_id: string; title: string; message: string; is_read?: boolean; created_at?: string };
        Update: { is_read?: boolean };
        Relationships: [];
      };
      prize_pools: {
        Row: { id: string; draw_id: string; total_amount: number; tier_5_amount: number; tier_4_amount: number; tier_3_amount: number; rolled_over_amount: number; created_at: string; updated_at: string };
        Insert: { id?: string; draw_id: string; total_amount: number; tier_5_amount: number; tier_4_amount: number; tier_3_amount: number; rolled_over_amount?: number; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['prize_pools']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      user_status: UserStatus;
      subscription_plan: SubscriptionPlan;
      subscription_status: SubscriptionStatus;
      score_status: ScoreStatus;
      draw_status: DrawStatus;
      payout_status: PayoutStatus;
      verification_status: VerificationStatus;
      match_type: MatchType;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type Charity = Database['public']['Tables']['charities']['Row'];
export type CharityDonation = Database['public']['Tables']['charity_donations']['Row'];
export type UserCharitySelection = Database['public']['Tables']['user_charity_selections']['Row'];
export type GolfScore = Database['public']['Tables']['golf_scores']['Row'];
export type DrawResult = Database['public']['Tables']['draw_results']['Row'];
export type DrawWinner = Database['public']['Tables']['draw_winners']['Row'];
export type WinnerVerification = Database['public']['Tables']['winner_verifications']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type PrizePool = Database['public']['Tables']['prize_pools']['Row'];
