"use client";
import { configureStore, createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { Provider, useDispatch, useSelector } from "react-redux";
import { axiosInstance, setAuthHeader } from "@/lib/axios";

type User = { username: string; avatarUrl?: string | null } | null;

type AuthState = {
  user: User;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
};

export const refreshSession = createAsyncThunk("auth/refresh", async () => {
  const res = await axiosInstance.post("/auth/refresh");
  // 约定后端结构 { code, message, data: { access_token } }
  if (res.data?.code !== 200) throw new Error(res.data?.message || "未登录");
  return res.data.data as { access_token: string };
});

export const loginThunk = createAsyncThunk("auth/login", async (payload: { username: string; password: string }) => {
  const res = await axiosInstance.post("/auth/login", payload);
  if (res.data?.code !== 200) throw new Error(res.data?.message || "登录失败");
  return res.data.data as { username: string; access_token: string };
});

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  await axiosInstance.post("/auth/logout");
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserProfile(state, action: PayloadAction<{ username: string; avatarUrl?: string | null }>) {
      if (!state.user) {
        state.user = { username: action.payload.username, avatarUrl: action.payload.avatarUrl };
      } else {
        state.user.username = action.payload.username;
        state.user.avatarUrl = action.payload.avatarUrl;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshSession.pending, (state) => { state.isLoading = true; })
      .addCase(refreshSession.fulfilled, (state, action: PayloadAction<{ access_token: string }>) => {
        state.accessToken = action.payload.access_token;
        state.isAuthenticated = true;
        state.isLoading = false;
        setAuthHeader(action.payload.access_token);
        try { if (typeof window !== "undefined") window.localStorage.setItem("access_token", action.payload.access_token); } catch {}
      })
      .addCase(refreshSession.rejected, (state) => {
        state.user = null; state.accessToken = null; state.isAuthenticated = false; state.isLoading = false;
        setAuthHeader(null);
        try { if (typeof window !== "undefined") window.localStorage.removeItem("access_token"); } catch {}
      })

      .addCase(loginThunk.fulfilled, (state, action: PayloadAction<{ username: string; access_token: string }>) => {
        state.user = { username: action.payload.username, avatarUrl: null };
        state.accessToken = action.payload.access_token;
        state.isAuthenticated = true;
        setAuthHeader(action.payload.access_token);
        try { if (typeof window !== "undefined") window.localStorage.setItem("access_token", action.payload.access_token); } catch {}
      })

      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null; state.accessToken = null; state.isAuthenticated = false;
        setAuthHeader(null);
        try { if (typeof window !== "undefined") window.localStorage.removeItem("access_token"); } catch {}
      });
  },
});

export const store = configureStore({ reducer: { auth: authSlice.reducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T,>(selector: (s: RootState) => T) => useSelector(selector);
export const { setUserProfile } = authSlice.actions;
