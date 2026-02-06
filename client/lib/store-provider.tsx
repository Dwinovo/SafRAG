"use client";
import React from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { refreshSession } from "@/lib/store";

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => { store.dispatch<any>(refreshSession()); }, []);
  return <Provider store={store}>{children}</Provider>;
}


