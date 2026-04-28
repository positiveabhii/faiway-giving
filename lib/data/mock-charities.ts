import { Charity } from '@/types';

export const mockCharities: Charity[] = [
  {
    id: "charity-1",
    name: "Green Horizons Foundation",
    mission: "Reforesting urban areas to create sustainable, breathable cities.",
    image_url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
    tags: ["Environment", "Sustainability"],
    is_spotlight: true,
    upcoming_events: 3,
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2026-04-01T10:00:00Z",
  },
  {
    id: "charity-2",
    name: "Fairway Scholars",
    mission: "Providing college scholarships to underprivileged youth through golf.",
    image_url: "https://images.unsplash.com/photo-1593111774240-d529f12eb4a6?w=800&q=80",
    tags: ["Education", "Youth"],
    is_spotlight: false,
    upcoming_events: 1,
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2026-04-01T10:00:00Z",
  },
  {
    id: "charity-3",
    name: "Heart Drive Initiative",
    mission: "Funding critical cardiovascular research and patient care.",
    image_url: "https://images.unsplash.com/photo-1530490125459-847a6d437825?w=800&q=80",
    tags: ["Health", "Research"],
    is_spotlight: false,
    upcoming_events: 5,
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2026-04-01T10:00:00Z",
  }
];
