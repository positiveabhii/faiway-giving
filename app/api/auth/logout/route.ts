import { getSupabaseServerClient } from "@/lib/supabase/server";
import { jsonError, jsonOk } from "@/lib/server/api";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) return jsonError(error.message, 500);
  return jsonOk({ signedOut: true });
}
