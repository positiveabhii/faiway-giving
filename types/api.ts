import type {
  Charity,
  CharityDonation,
  DrawResult,
  DrawWinner,
  GolfScore,
  Notification,
  Profile,
  PrizePool,
  Subscription,
  UserCharitySelection,
  WinnerVerification,
} from "@/types/database";
import type { ApiErrorDetail, DrawMode } from "@/types/domain";
import type { Session } from "@supabase/supabase-js";

export type ApiSuccess<T> = { ok: true; data: T };
export type ApiFailure = { ok: false; error: string; details?: ApiErrorDetail[] };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface SignupRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  plan: "monthly" | "yearly";
  charity_id: string;
  contribution_percentage: number;
}

export interface SignupResponse {
  session: Session | null;
  profile: Profile;
  subscription: Subscription | null;
  charitySelection: UserCharitySelection | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthSessionResponse {
  session: Session | null;
  profile: Profile | null;
}

export interface AppDataResponse {
  charities: Charity[];
  scores: GolfScore[];
  draws: DrawResult[];
  prizePools: PrizePool[];
  subscriptions: Subscription[];
  winnings: DrawWinner[];
  verifications: WinnerVerification[];
  notifications: Notification[];
  userCharitySelections: UserCharitySelection[];
  users: Profile[];
  billingTransactions: BillingTransaction[];
}

export interface ScoreCreateRequest {
  score_value: number;
  played_date: string;
}

export interface ScoreDeleteRequest {
  score_id: string;
}

export interface DonationCreateRequest {
  charity_id: string;
  amount: number;
}

export interface CharitySelectionRequest {
  charity_id: string;
  contribution_percentage: number;
}

export interface DrawExecuteRequest {
  draw_id: string;
  mode: DrawMode;
}

export interface DrawExecuteResponse {
  draw: DrawResult;
  winners: DrawWinner[];
  luckyNumbers: number[];
}

export type WinnerVerifyAction = "submit_proof" | "approve" | "reject" | "mark_paid";

export interface WinnerVerifyRequest {
  action: WinnerVerifyAction;
  winner_id?: string;
  verification_id?: string;
  proof_url?: string;
  notes?: string;
}

export interface SubscriptionManageRequest {
  user_id?: string;
  plan?: "monthly" | "yearly";
  status?: "active" | "canceled" | "past_due";
}

export interface AdminUserUpdateRequest {
  user_id: string;
  first_name?: string;
  last_name?: string;
  status?: "active" | "suspended";
  role?: "admin" | "subscriber";
}

export interface CharityWriteRequest {
  id?: string;
  name: string;
  mission: string;
  image_url: string;
  tags: string[];
  is_spotlight: boolean;
  total_raised?: number;
  upcoming_events?: number;
}

export interface CharityDeleteRequest {
  id: string;
}

export interface NotificationReadRequest {
  notification_id?: string;
  all?: boolean;
}

export interface MutationResponses {
  signup: SignupResponse;
  score: GolfScore;
  scoreDelete: { id: string };
  donation: CharityDonation;
  charitySelection: UserCharitySelection;
  drawExecute: DrawExecuteResponse;
  winnerVerification: WinnerVerification;
  winnerPaid: { winner_id: string };
  subscription: Subscription;
  adminUser: Profile;
  charity: Charity;
  charityDelete: { id: string };
  notificationRead: { count: number };
  paymentOrder: PaymentOrderResponse;
  paymentVerify: { success: true };
}

export interface PaymentOrderRequest {
  plan: "monthly" | "yearly";
}

export interface PaymentOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
}

export interface PaymentVerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  plan: "monthly" | "yearly";
}
