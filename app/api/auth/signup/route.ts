import { getSupabaseServerClient, getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { jsonError, jsonOk, parseJson } from "@/lib/server/api";
import { signupSchema } from "@/lib/validations/auth";
import type { SignupResponse } from "@/types/api";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await parseJson(request, signupSchema);
  if (body instanceof Response) return body;

  const supabase = await getSupabaseServerClient();
  const writer = getSupabaseServiceRoleClient() ?? supabase;

  const { data: charity, error: charityError } = await writer
    .from("charities")
    .select("id")
    .eq("id", body.charity_id)
    .maybeSingle();

  if (charityError) return jsonError("Unable to validate the selected charity.", 500);
  if (!charity) return jsonError("Choose an active charity before continuing.", 422);

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: body.email,
    password: body.password,
    options: {
      data: {
        first_name: body.first_name,
        last_name: body.last_name,
      },
      emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
    },
  });

  if (authError || !authData.user) {
    return jsonError(authError?.message ?? "Signup failed. Please try again.", 400);
  }

  const userId = authData.user.id;

  // STRICT RULE: Profile status is pending_payment until verification
  const { data: profile, error: profileError } = await writer
    .from("profiles")
    .upsert({
      id: userId,
      email: body.email,
      first_name: body.first_name,
      last_name: body.last_name,
      role: "subscriber",
      status: "pending_payment", // Correct state
    }, { onConflict: "id" })
    .select()
    .single();

  if (profileError) return jsonError(`Profile synchronization failed: ${profileError.message}`, 500);

  // STRICT RULE: Subscription status is pending_payment, no renewal date yet
  const { data: subscription, error: subscriptionError } = await writer
    .from("subscriptions")
    .upsert({
      user_id: userId,
      plan: body.plan,
      status: "pending_payment", // Correct state
      next_renewal_date: null, // Null until payment
    }, { onConflict: "user_id" })
    .select()
    .single();

  if (subscriptionError) return jsonError(`Subscription setup failed: ${subscriptionError.message}`, 500);

  const { data: charitySelection, error: selectionError } = await writer
    .from("user_charity_selections")
    .upsert({
      user_id: userId,
      charity_id: body.charity_id,
      contribution_percentage: body.contribution_percentage,
    }, { onConflict: "user_id" })
    .select()
    .single();

  if (selectionError) return jsonError(`Charity selection setup failed: ${selectionError.message}`, 500);

  const response: SignupResponse = { session: authData.session, profile, subscription, charitySelection };
  return jsonOk(response, { status: 201 });
}
