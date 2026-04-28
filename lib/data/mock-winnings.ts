import { Winner, PayoutVerification } from '@/types';

export const mockWinnings: Winner[] = [
  {
    id: "win-1",
    draw_id: "draw-2",
    user_id: "user-1",
    match_type: "4 Matches",
    prize_amount: 5000,
    payout_status: "paid",
    proof_url: "https://example.com/proof-1.jpg",
    created_at: "2026-03-31T10:00:00Z",
    updated_at: "2026-04-05T10:00:00Z",
  },
  {
    id: "win-2",
    draw_id: "draw-old",
    user_id: "user-1",
    match_type: "5 Matches",
    prize_amount: 25000,
    payout_status: "paid",
    proof_url: "https://example.com/proof-2.jpg",
    created_at: "2025-11-30T10:00:00Z",
    updated_at: "2025-12-05T10:00:00Z",
  },
  {
    id: "win-3",
    draw_id: "draw-2",
    user_id: "user-3",
    match_type: "5 Matches",
    prize_amount: 50000,
    payout_status: "pending",
    proof_url: "https://example.com/proof-3.jpg",
    created_at: "2026-03-31T10:00:00Z",
    updated_at: "2026-03-31T10:00:00Z",
  },
  {
    id: "win-4",
    draw_id: "draw-2",
    user_id: "user-4",
    match_type: "4 Matches",
    prize_amount: 5000,
    payout_status: "pending",
    proof_url: "https://example.com/proof-4.jpg",
    created_at: "2026-03-31T10:00:00Z",
    updated_at: "2026-03-31T10:00:00Z",
  }
];

export const mockVerifications: PayoutVerification[] = [
  {
    id: "verify-1",
    winner_id: "win-3",
    user_id: "user-3",
    admin_id: null,
    status: "pending",
    notes: null,
    verified_at: null,
    created_at: "2026-04-01T10:00:00Z",
    updated_at: "2026-04-01T10:00:00Z",
  },
  {
    id: "verify-2",
    winner_id: "win-4",
    user_id: "user-4",
    admin_id: null,
    status: "pending",
    notes: null,
    verified_at: null,
    created_at: "2026-04-02T10:00:00Z",
    updated_at: "2026-04-02T10:00:00Z",
  }
];
