import { PrizePool, Winner } from "@/types";

export const calculatePrizePool = (
  activeSubscribersCount: number,
  subscriptionPrice: number,
  prizePoolPercentage: number = 0.5, // e.g., 50% of revenue goes to prize pool
  previousRolloverAmount: number = 0
): Partial<PrizePool> => {
  const newRevenue = activeSubscribersCount * subscriptionPrice;
  const newPrizeMoney = newRevenue * prizePoolPercentage;
  
  const totalAmount = newPrizeMoney + previousRolloverAmount;
  
  return {
    total_amount: totalAmount,
    tier_5_amount: totalAmount * 0.40,
    tier_4_amount: totalAmount * 0.35,
    tier_3_amount: totalAmount * 0.25,
    rolled_over_amount: previousRolloverAmount, // just tracking what came in
  };
};

export const calculatePayouts = (
  pool: Partial<PrizePool>,
  winners: { user_id: string; match_count: number }[]
) => {
  const tier5Winners = winners.filter(w => w.match_count === 5);
  const tier4Winners = winners.filter(w => w.match_count === 4);
  const tier3Winners = winners.filter(w => w.match_count === 3);

  const newRolloverAmount = tier5Winners.length === 0 ? pool.tier_5_amount! : 0;
  
  const payouts: Omit<Winner, 'id' | 'created_at' | 'updated_at' | 'draw_id' | 'payout_status' | 'proof_url'>[] = [];

  if (tier5Winners.length > 0) {
    const amountPerWinner = pool.tier_5_amount! / tier5Winners.length;
    tier5Winners.forEach(w => payouts.push({ user_id: w.user_id, match_type: '5 Matches', prize_amount: amountPerWinner }));
  }

  if (tier4Winners.length > 0) {
    const amountPerWinner = pool.tier_4_amount! / tier4Winners.length;
    tier4Winners.forEach(w => payouts.push({ user_id: w.user_id, match_type: '4 Matches', prize_amount: amountPerWinner }));
  }

  if (tier3Winners.length > 0) {
    const amountPerWinner = pool.tier_3_amount! / tier3Winners.length;
    tier3Winners.forEach(w => payouts.push({ user_id: w.user_id, match_type: '3 Matches', prize_amount: amountPerWinner }));
  }

  return {
    payouts,
    nextRolloverAmount: newRolloverAmount
  };
};
