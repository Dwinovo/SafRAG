export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    try { localStorage.setItem("access_token", token); } catch {}
  } else {
    try { localStorage.removeItem("access_token"); } catch {}
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  try { accessToken = localStorage.getItem("access_token"); } catch {}
  return accessToken;
}

async function request<T>(path: string, options: RequestInit & { method?: HttpMethod } = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const token = getAccessToken();
  if (token) headers.set("Authorization", token);

  const res = await fetch(path.startsWith("/") ? path : `/api/${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body,
    credentials: "include", // 发送/接收 HttpOnly Cookie（refresh_token）
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || (data && typeof data.code === "number" && data.code !== 200)) {
    // 优先尝试刷新 access_token
    const retry = await tryRefresh();
    if (retry) {
      const retryHeaders = new Headers(options.headers || {});
      const newToken = getAccessToken();
      if (newToken) retryHeaders.set("Authorization", newToken);
      const res2 = await fetch(path.startsWith("/") ? path : `/api/${path}`, {
        method: options.method || "GET",
        headers: retryHeaders,
        body: options.body,
        credentials: "include",
      });
      const data2 = await res2.json().catch(() => ({}));
      if (!res2.ok || (data2 && typeof data2.code === "number" && data2.code !== 200)) {
        throw new Error(data2?.message || `Request failed: ${res2.status}`);
      }
      return data2?.data ?? data2;
    }
    throw new Error(data?.message || `Request failed: ${res.status}`);
  }
  return data?.data ?? data;
}

export async function login(username: string, password: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok || data.code !== 200) throw new Error(data.message || "登录失败");
  const token = data.data?.access_token as string | undefined;
  if (token) setAccessToken(token);
  return data.data;
}

export async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok && data.code === 200 && data.data?.access_token) {
      setAccessToken(data.data.access_token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function logout() {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  } finally {
    setAccessToken(null);
  }
}

export const api = {
  request,
  login,
  tryRefresh,
  logout,
  setAccessToken,
  getAccessToken,
};

