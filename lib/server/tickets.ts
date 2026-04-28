import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { buildTicketsForDraw, buildUserTicketFromScores } from "@/lib/utils/ticket-engine";

export async function buildUserTicketForDraw(
  supabase: SupabaseClient<Database>,
  userId: string,
  drawId: string
) {
  const { data, error } = await supabase
    .from("golf_scores")
    .select("*")
    .eq("user_id", userId)
    .eq("draw_id", drawId)
    .eq("status", "verified");

  if (error) return { data: null, error };
  return { data: buildUserTicketFromScores(data ?? [], userId, drawId), error: null };
}

export async function buildDrawTickets(
  supabase: SupabaseClient<Database>,
  drawId: string
) {
  const { data, error } = await supabase
    .from("golf_scores")
    .select("*")
    .eq("draw_id", drawId)
    .eq("status", "verified");

  if (error) return { data: null, error };
  return { data: buildTicketsForDraw(data ?? [], drawId), error: null };
}
