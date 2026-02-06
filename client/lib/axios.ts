import axios from "axios";

const apiBase = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE)
  ? `${process.env.NEXT_PUBLIC_API_BASE}/api`
  : "/api";

export const axiosInstance = axios.create({
  baseURL: apiBase,
  withCredentials: true, // 发送/接收 HttpOnly Cookie（refresh_token）
});

export function setAuthHeader(accessToken: string | null) {
  if (accessToken) {
    axiosInstance.defaults.headers.common["Authorization"] = accessToken;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
}

// 浏览器环境：尽早用 localStorage 中的 access_token 初始化默认头
try {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("access_token");
    if (token) setAuthHeader(token);
  }
} catch {}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
let subscribers: Array<(token: string | null) => void> = [];

function subscribeTokenRefresh(cb: (token: string | null) => void) {
  subscribers.push(cb);
}

function onRefreshed(token: string | null) {
  const cbs = subscribers;
  subscribers = [];
  cbs.forEach((cb) => cb(token));
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshUrl = `${apiBase.replace(/\/$/, "")}/auth/refresh`;
  try {
    const res = await axios.post(
      refreshUrl,
      {},
      { withCredentials: true }
    );
    const data = res?.data;
    if (data && data.code === 200 && data.data?.access_token) {
      const newToken: string = data.data.access_token;
      setAuthHeader(newToken);
      try { if (typeof window !== "undefined") window.localStorage.setItem("access_token", newToken); } catch {}
      return newToken;
    }
  } catch {}
  // 刷新失败：清理token并重定向到登录页
  setAuthHeader(null);
  try {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("access_token");
      // 只在非登录页面时重定向，避免无限循环
      if (!window.location.pathname.startsWith("/sign-in")) {
        window.location.href = "/sign-in";
      }
    }
  } catch {}
  return null;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error || {};
    const status = response?.status;
    const originalRequest = config || {};

    // 跳过登录/注册/刷新本身，或无 401 情况
    const url: string = originalRequest?.url || "";
  if (
      status !== 401 ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/login")
    ) {
      return Promise.reject(error);
    }

    // 防止无限重试
    if ((originalRequest as any)._retry) {
      return Promise.reject(error);
    }
    (originalRequest as any)._retry = true;

    // 若正在刷新，排队等待
    if (isRefreshing && refreshPromise) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          if (!token) return reject(error);
          try {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers["Authorization"] = token;
          } catch {}
          resolve(axiosInstance(originalRequest));
        });
      });
    }

    // 发起刷新
    isRefreshing = true;
    refreshPromise = refreshAccessToken();

    try {
      const newToken = await refreshPromise;
      onRefreshed(newToken);
      if (!newToken) {
        // refreshAccessToken函数已经处理了重定向，这里只需要拒绝请求
        return Promise.reject(error);
      }
      try {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers["Authorization"] = newToken;
      } catch {}
      return axiosInstance(originalRequest);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  }
);

