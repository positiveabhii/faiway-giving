import { GolfScore } from '@/types';

export const mockScores: GolfScore[] = [
  // User 1 scores
  {
    id: "score-1",
    user_id: "user-1",
    draw_id: "draw-1",
    score_value: 32,
    played_date: "2026-04-20",
    status: "entered",
    created_at: "2026-04-20T10:00:00Z",
    updated_at: "2026-04-20T10:00:00Z",
  },
  {
    id: "score-2",
    user_id: "user-1",
    draw_id: "draw-1",
    score_value: 28,
    played_date: "2026-04-12",
    status: "entered",
    created_at: "2026-04-12T10:00:00Z",
    updated_at: "2026-04-12T10:00:00Z",
  },
  {
    id: "score-3",
    user_id: "user-1",
    draw_id: "draw-1",
    score_value: 40,
    played_date: "2026-04-05",
    status: "entered",
    created_at: "2026-04-05T10:00:00Z",
    updated_at: "2026-04-05T10:00:00Z",
  },
  {
    id: "score-4",
    user_id: "user-1",
    draw_id: "draw-1",
    score_value: 35,
    played_date: "2026-03-28",
    status: "entered",
    created_at: "2026-03-28T10:00:00Z",
    updated_at: "2026-03-28T10:00:00Z",
  },
  {
    id: "score-5",
    user_id: "user-1",
    draw_id: "draw-1",
    score_value: 22,
    played_date: "2026-03-15",
    status: "entered",
    created_at: "2026-03-15T10:00:00Z",
    updated_at: "2026-03-15T10:00:00Z",
  },
  
  // User 3 scores
  {
    id: "score-6",
    user_id: "user-3",
    draw_id: "draw-1",
    score_value: 36,
    played_date: "2026-04-18",
    status: "entered",
    created_at: "2026-04-18T10:00:00Z",
    updated_at: "2026-04-18T10:00:00Z",
  },
  
  // User 4 scores
  {
    id: "score-7",
    user_id: "user-4",
    draw_id: "draw-1",
    score_value: 42,
    played_date: "2026-04-19",
    status: "entered",
    created_at: "2026-04-19T10:00:00Z",
    updated_at: "2026-04-19T10:00:00Z",
  }
];
