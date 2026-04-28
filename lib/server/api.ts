import { ZodError, type ZodSchema } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ApiFailure, ApiResponse, ApiSuccess } from "@/types/api";
import type { Profile } from "@/types/database";

export const dynamic = "force-dynamic";

export function jsonOk<T>(data: T, init?: ResponseInit): Response {
  const body: ApiSuccess<T> = { ok: true, data };
  return Response.json(body, init);
}

export function jsonError(error: string, status = 400, details?: ApiFailure["details"]): Response {
  const body: ApiFailure = { ok: false, error, details };
  return Response.json(body, { status });
}

export async function parseJson<T>(request: Request, schema: ZodSchema<T>): Promise<T | Response> {
  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400);
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return jsonError("Please check the highlighted fields and try again.", 422, formatZodError(parsed.error));
  }

  return parsed.data;
}

export async function requireAuth() {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { response: jsonError("Sign in is required to continue.", 401) };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    return { response: jsonError("Unable to load your account permissions.", 500) };
  }

  if (!profile) {
    return { response: jsonError("Your account profile is not ready yet.", 403) };
  }

  if (profile.status === "suspended") {
    return { response: jsonError("This account has been suspended.", 403) };
  }

  return { supabase, authUser: data.user, profile };
}

export async function requireActive() {
  const auth = await requireAuth();
  if ("response" in auth) return auth;

  if (auth.profile.status !== "active") {
    return { response: jsonError("An active membership is required for this action.", 403) };
  }

  return auth;
}

export async function requireAdmin() {
  const auth = await requireAuth();

  if ("response" in auth) {
    return auth;
  }

  if (auth.profile.role !== "admin") {
    return { response: jsonError("Admin access is required for this action.", 403) };
  }

  return auth;
}

export function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${String(value)}`);
}

function formatZodError(error: ZodError): ApiFailure["details"] {
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || undefined,
    message: issue.message,
  }));
}

export type ApiHandlerResult<T> = Response | ApiResponse<T>;
export type AuthProfile = Profile;
