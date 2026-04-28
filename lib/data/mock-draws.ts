import { DrawResult, PrizePool } from '@/types';

export const mockDraws: DrawResult[] = [
  {
    id: "draw-1",
    month_name: "April 2026",
    status: "upcoming",
    countdown_end: "2026-05-01T00:00:00Z",
    lucky_numbers: null,
    total_jackpot: 2500000,
    total_participants: 14502,
    created_at: "2026-04-01T00:00:00Z",
    updated_at: "2026-04-01T00:00:00Z",
  },
  {
    id: "draw-2",
    month_name: "March 2026",
    status: "completed",
    countdown_end: null,
    lucky_numbers: [7, 14, 22, 35, 41],
    total_jackpot: 2100000,
    total_participants: 13200,
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-04-01T00:00:00Z",
  }
];

export const mockPrizePools: PrizePool[] = [
  {
    id: "pool-1",
    draw_id: "draw-1",
    total_amount: 2500000,
    tier_5_amount: 1000000, // 40%
    tier_4_amount: 875000,  // 35%
    tier_3_amount: 625000,  // 25%
    rolled_over_amount: 1100000,
    created_at: "2026-04-01T00:00:00Z",
    updated_at: "2026-04-01T00:00:00Z",
  },
  {
    id: "pool-2",
    draw_id: "draw-2",
    total_amount: 2100000,
    tier_5_amount: 840000,
    tier_4_amount: 735000,
    tier_3_amount: 525000,
    rolled_over_amount: 0,
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-04-01T00:00:00Z",
  }
];
