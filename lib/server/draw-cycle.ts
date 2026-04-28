import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

export async function getOrCreateActiveDraw(supabase: SupabaseClient<Database>) {
  const now = new Date();
  const monthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  
  try {
    // 1. Try to find the upcoming draw for this month
    const { data: existingDraw, error: findError } = await supabase
      .from("draw_results")
      .select("*")
      .eq("month_name", monthName)
      .eq("status", "upcoming")
      .maybeSingle();

    if (findError) return { data: null, error: findError };
    
    if (existingDraw) {
      const { data: pool } = await supabase
        .from("prize_pools")
        .select("*")
        .eq("draw_id", existingDraw.id)
        .maybeSingle();
      return { data: { ...existingDraw, prize_pools: pool }, error: null };
    }

    // 2. If not found, we need to create it.
    const { data: lastDraw } = await supabase
      .from("draw_results")
      .select("*")
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let rolloverAmount = 0;
    if (lastDraw) {
      const { data: lastPool } = await supabase
        .from("prize_pools")
        .select("*")
        .eq("draw_id", lastDraw.id)
        .maybeSingle();

      if (lastPool) {
        const { count: winnerCount } = await supabase
          .from("draw_winners")
          .select("id", { count: 'exact', head: true })
          .eq("draw_id", lastDraw.id)
          .eq("match_type", "5 Matches");

        if (winnerCount === 0) {
          rolloverAmount = Number(lastPool.tier_5_amount || 0);
        }
      }
    }

    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const { data: newDraw, error: createDrawError } = await supabase
      .from("draw_results")
      .insert({
        month_name: monthName,
        status: "upcoming",
        countdown_end: nextMonth.toISOString(),
        total_jackpot: rolloverAmount + 1000000,
      })
      .select()
      .single();

    if (createDrawError) return { data: null, error: createDrawError };

    const totalAmount = Number(newDraw.total_jackpot);
    const { data: pool, error: createPoolError } = await supabase
      .from("prize_pools")
      .insert({
        draw_id: newDraw.id,
        total_amount: totalAmount,
        tier_5_amount: totalAmount * 0.4,
        tier_4_amount: totalAmount * 0.35,
        tier_3_amount: totalAmount * 0.25,
        rolled_over_amount: rolloverAmount,
      })
      .select()
      .single();

    if (createPoolError) return { data: null, error: createPoolError };

    return { data: { ...newDraw, prize_pools: pool }, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}
