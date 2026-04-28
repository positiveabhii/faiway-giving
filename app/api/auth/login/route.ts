import { getSupabaseServerClient } from "@/lib/supabase/server";
import { jsonError, jsonOk, parseJson } from "@/lib/server/api";
import { loginSchema } from "@/lib/validations/auth";
import type { AuthSessionResponse } from "@/types/api";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await parseJson(request, loginSchema);
  if (body instanceof Response) return body;

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });

  if (error || !data.session) {
    return jsonError(error?.message ?? "Invalid credentials.", 401);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.session.user.id)
    .maybeSingle();

  if (profileError) return jsonError("Unable to load your account profile.", 500);

  return jsonOk<AuthSessionResponse>({ session: data.session, profile: profile ?? null });
}
