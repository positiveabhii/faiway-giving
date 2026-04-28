import { apiJson } from "@/lib/api/client";
import type { ApiResponse, AuthSessionResponse, LoginRequest, SignupRequest, SignupResponse } from "@/types/api";

export function signup(data: SignupRequest) {
  return apiJson<SignupResponse, SignupRequest>("/api/auth/signup", "POST", data);
}

export function login(data: LoginRequest) {
  return apiJson<AuthSessionResponse, LoginRequest>("/api/auth/login", "POST", data);
}

export function logout() {
  return apiJson<{ signedOut: boolean }, Record<string, never>>("/api/auth/logout", "POST", {});
}

export async function getAuthSession() {
  const response = await fetch("/api/auth/session", { method: "GET" });
  return response.json().then((payload: ApiResponse<AuthSessionResponse>) => {
    if (!payload.ok) throw new Error(payload.error);
    return payload.data as AuthSessionResponse;
  });
}
