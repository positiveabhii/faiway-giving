import { jsonError, jsonOk, parseJson, requireAdmin } from "@/lib/server/api";
import { deterministicLuckyNumbers } from "@/lib/server/draw";
import { buildDrawTickets } from "@/lib/server/tickets";
import { evaluateTickets } from "@/lib/utils/ticket-engine";
import { drawExecuteSchema } from "@/lib/validations/draw";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const body = await parseJson(request, drawExecuteSchema);
  if (body instanceof Response) return body;

  const { data: draw, error: drawError } = await auth.supabase
    .from("draw_results")
    .select("*")
    .eq("id", body.draw_id)
    .maybeSingle();

  if (drawError) return jsonError("Unable to load the draw.", 500);
  if (!draw) return jsonError("Draw not found.", 404);

  const { data: entries, error: ticketsError } = await buildDrawTickets(auth.supabase, body.draw_id);
  if (ticketsError) return jsonError("Unable to build tickets for this draw.", 500);

  const luckyNumbers = body.lucky_numbers ?? deterministicLuckyNumbers(`${draw.id}:${draw.month_name}:${draw.countdown_end ?? ""}`, body.mode);
  return jsonOk(evaluateTickets(luckyNumbers, entries ?? []));
}
