export const mockCharities = [
  {
    id: "c1",
    name: "Green Horizons Foundation",
    mission: "Reforesting urban areas to create sustainable, breathable cities.",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
    stats: { totalRaised: "$1,250,000", upcomingEvents: 3 },
    tags: ["Environment", "Sustainability"]
  },
  {
    id: "c2",
    name: "Fairway Scholars",
    mission: "Providing college scholarships to underprivileged youth through golf.",
    image: "https://images.unsplash.com/photo-1593111774240-d529f12eb4a6?w=800&q=80",
    stats: { totalRaised: "$890,000", upcomingEvents: 1 },
    tags: ["Education", "Youth"]
  },
  {
    id: "c3",
    name: "Heart Drive Initiative",
    mission: "Funding critical cardiovascular research and patient care.",
    image: "https://images.unsplash.com/photo-1530490125459-847a6d437825?w=800&q=80",
    stats: { totalRaised: "$2,100,000", upcomingEvents: 5 },
    tags: ["Health", "Research"]
  }
];

export const mockUser = {
  id: "u1",
  name: "Alexander Sterling",
  email: "alexander.s@example.com",
  avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
  subscription: {
    plan: "Premium Yearly",
    status: "Active",
    nextRenewal: "2027-04-27",
  },
  charity: {
    selected: mockCharities[0],
    contributionPercentage: 15, // 15% of winnings goes to charity
    totalDonated: "$4,500"
  },
  stats: {
    totalEntries: 24,
    totalWon: "$30,000",
  }
};

export const mockGolfScores = [
  { id: "s1", date: "2026-04-20", score: 32, status: "Entered" },
  { id: "s2", date: "2026-04-12", score: 28, status: "Entered" },
  { id: "s3", date: "2026-04-05", score: 40, status: "Entered" },
  { id: "s4", date: "2026-03-28", score: 35, status: "Entered" },
  { id: "s5", date: "2026-03-15", score: 22, status: "Entered" },
];

export const mockDraws = [
  {
    id: "d1",
    month: "April 2026",
    status: "Upcoming",
    countdown: "4 Days 12 Hours",
    luckyNumbers: [12, 28, 35, 40, 5],
    jackpot: "$2,500,000",
    participants: 14502
  },
  {
    id: "d2",
    month: "March 2026",
    status: "Completed",
    countdown: "0",
    luckyNumbers: [7, 14, 22, 35, 41],
    jackpot: "$2,100,000",
    participants: 13200
  }
];

export const mockWinnings = [
  { id: "w1", date: "2026-03-31", amount: "$5,000", matchType: "4 Matches", status: "Paid" },
  { id: "w2", date: "2025-11-30", amount: "$25,000", matchType: "5 Matches", status: "Paid" },
];

export const mockNotifications = [
  { id: "n1", title: "Score Accepted", message: "Your score of 32 on Apr 20 was accepted.", date: "2 hours ago", read: false },
  { id: "n2", title: "Draw Upcoming", message: "April Draw is happening in 4 days!", date: "1 day ago", read: true },
  { id: "n3", title: "Charity Milestone", message: "Your selected charity reached $1M in funding.", date: "3 days ago", read: true }
];

export const mockAdminStats = {
  totalSubscribers: 42500,
  activePrizePool: "$2,500,000",
  charityTotals: "$12,400,000",
  pendingVerifications: 14,
  monthlyGrowth: "+8.4%",
};

export const mockAdminUsers = [
  { id: "au1", name: "Eleanor Richards", email: "erichards@example.com", plan: "Monthly", status: "Active" },
  { id: "au2", name: "Marcus Thorne", email: "mthorne@example.com", plan: "Yearly", status: "Active" },
  { id: "au3", name: "Sophia Lin", email: "slin@example.com", plan: "Yearly", status: "Suspended" },
  { id: "au4", name: "David Vance", email: "dvance@example.com", plan: "Monthly", status: "Active" },
];

export const mockAdminVerifications = [
  { id: "v1", userName: "Marcus Thorne", amount: "$50,000", matchType: "5 Matches", proofUrl: "proof1.jpg", status: "Pending" },
  { id: "v2", userName: "Elena Rostova", amount: "$5,000", matchType: "4 Matches", proofUrl: "proof2.jpg", status: "Pending" }
];
