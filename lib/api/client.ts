import type { ApiResponse } from "@/types/api";

export class ApiClientError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

export async function apiJson<TResponse, TRequest>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body: TRequest
): Promise<TResponse> {
  const response = await fetch(path, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  return readApiResponse<TResponse>(response);
}

export async function apiForm<TResponse>(path: string, form: FormData): Promise<TResponse> {
  const response = await fetch(path, {
    method: "POST",
    body: form,
  });

  return readApiResponse<TResponse>(response);
}

async function readApiResponse<TResponse>(response: Response): Promise<TResponse> {
  let payload: ApiResponse<TResponse>;

  try {
    payload = await response.json();
  } catch {
    throw new ApiClientError("The server returned an unreadable response.", response.status);
  }

  if (!payload.ok) {
    const detail = payload.details?.[0]?.message;
    throw new ApiClientError(detail ?? payload.error, response.status);
  }

  return payload.data;
}
