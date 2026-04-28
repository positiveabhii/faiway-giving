import { User, Subscription, UserCharitySelection } from '@/types';

export const mockUsers: User[] = [
  {
    id: "user-1",
    email: "alexander.s@example.com",
    first_name: "Alexander",
    last_name: "Sterling",
    avatar_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
    role: "subscriber",
    status: "active",
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "user-2",
    email: "admin@fairwaygiving.com",
    first_name: "System",
    last_name: "Admin",
    role: "admin",
    status: "active",
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2025-01-01T10:00:00Z",
  },
  {
    id: "user-3",
    email: "marcus.t@example.com",
    first_name: "Marcus",
    last_name: "Thorne",
    role: "subscriber",
    status: "active",
    created_at: "2025-02-10T10:00:00Z",
    updated_at: "2025-02-10T10:00:00Z",
  },
  {
    id: "user-4",
    email: "elena.r@example.com",
    first_name: "Elena",
    last_name: "Rostova",
    role: "subscriber",
    status: "active",
    created_at: "2025-03-05T10:00:00Z",
    updated_at: "2025-03-05T10:00:00Z",
  }
];

export const mockSubscriptions: Subscription[] = [
  {
    id: "sub-1",
    user_id: "user-1",
    plan: "yearly",
    status: "active",
    next_renewal_date: "2026-01-15T10:00:00Z",
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "sub-3",
    user_id: "user-3",
    plan: "yearly",
    status: "active",
    next_renewal_date: "2026-02-10T10:00:00Z",
    created_at: "2025-02-10T10:00:00Z",
    updated_at: "2025-02-10T10:00:00Z",
  },
  {
    id: "sub-4",
    user_id: "user-4",
    plan: "monthly",
    status: "active",
    next_renewal_date: "2026-05-05T10:00:00Z",
    created_at: "2025-03-05T10:00:00Z",
    updated_at: "2025-04-05T10:00:00Z",
  }
];

export const mockUserCharities: UserCharitySelection[] = [
  {
    id: "uc-1",
    user_id: "user-1",
    charity_id: "charity-1",
    contribution_percentage: 15,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "uc-3",
    user_id: "user-3",
    charity_id: "charity-2",
    contribution_percentage: 10,
    created_at: "2025-02-10T10:00:00Z",
    updated_at: "2025-02-10T10:00:00Z",
  },
  {
    id: "uc-4",
    user_id: "user-4",
    charity_id: "charity-3",
    contribution_percentage: 20,
    created_at: "2025-03-05T10:00:00Z",
    updated_at: "2025-03-05T10:00:00Z",
  }
];
