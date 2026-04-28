import { Charity, UserCharitySelection, Winner } from "@/types";

export const calculateBaseCharityDonation = (
  activeSubscribersCount: number,
  subscriptionPrice: number,
  charityPoolPercentage: number = 0.1 // 10% of total revenue goes to charity directly
): number => {
  return activeSubscribersCount * subscriptionPrice * charityPoolPercentage;
};

// Calculates total funds directed to a specific charity across all users based on their selections
export const calculateCharityLeaderboard = (
  charities: Charity[],
  userSelections: UserCharitySelection[],
  baseDonationPool: number // The total base donation pool to be distributed
) => {
  const leaderboard = charities.map(c => ({ charity_id: c.id, name: c.name, total: 0 }));
  
  if (userSelections.length === 0) return leaderboard;
  
  // Distributed equally among users, then directed to their chosen charity
  const amountPerUser = baseDonationPool / userSelections.length;
  
  userSelections.forEach(selection => {
    const charityStat = leaderboard.find(l => l.charity_id === selection.charity_id);
    if (charityStat) {
      charityStat.total += amountPerUser;
    }
  });
  
  return leaderboard.sort((a, b) => b.total - a.total);
};

export const calculateWinningContributions = (
  winners: Winner[],
  userSelections: UserCharitySelection[]
) => {
  let totalWinningsDonated = 0;
  
  winners.forEach(winner => {
    const selection = userSelections.find(s => s.user_id === winner.user_id);
    if (selection && selection.contribution_percentage > 0) {
      const contribution = winner.prize_amount * (selection.contribution_percentage / 100);
      totalWinningsDonated += contribution;
    }
  });
  
  return totalWinningsDonated;
};

export const updateUserCharityContribution = (
  selections: UserCharitySelection[],
  userId: string,
  newPercentage: number
): UserCharitySelection[] => {
  return selections.map(s => 
    s.user_id === userId ? { ...s, contribution_percentage: newPercentage, updated_at: new Date().toISOString() } : s
  );
};
