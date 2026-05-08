/*
Tiny fetch wrapper.

Why not axios: a `fetch` JSON helper is ~30 lines and ships zero KB.
We just want consistent error handling.

ApiError carries the HTTP status so callers can branch (e.g. show a
"not found" UI for 404 vs a generic message for 500).
*/

const BASE = "/api"

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message)
    this.name = "ApiError"
  }
}

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  // 202 Accepted from POSTs may have a body; 204 won't
  const text = await res.text()
  const body = text ? JSON.parse(text) : undefined

  if (!res.ok) {
    const msg = (body && typeof body === "object" && "message" in body
      ? String((body as { message: unknown }).message)
      : res.statusText)
    throw new ApiError(res.status, msg, body)
  }

  return body as T
}

export const api = {
  get:  <T>(path: string)            => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
}
