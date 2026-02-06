"use client";

import { axiosInstance } from "@/lib/axios";

/**
 * 尝试从当前 access_token 中解析出用户 ID。
 * 解析失败时返回 null。
 */
export const getCurrentUserId = (): number | null => {
  if (typeof window === "undefined") return null;
  try {
    const storedToken = window.localStorage.getItem("access_token");
    const headerToken =
      typeof axiosInstance.defaults.headers.common?.Authorization === "string"
        ? (axiosInstance.defaults.headers.common.Authorization as string)
        : null;
    const tokenWithPrefix = storedToken ?? headerToken;
    if (!tokenWithPrefix) return null;
    const token = tokenWithPrefix.replace(/^Bearer\s+/i, "");
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(window.atob(padded));
    const sub = payload?.sub;
    if (!sub) return null;
    const id = Number(sub);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
};

