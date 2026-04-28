import { getSupabaseServerClient } from "@/lib/supabase/server";
import { jsonOk } from "@/lib/server/api";
import type { AuthSessionResponse } from "@/types/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;

  if (!session) {
    return jsonOk<AuthSessionResponse>({ session: null, profile: null });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .maybeSingle();

  return jsonOk<AuthSessionResponse>({ session, profile: profile ?? null });
}
