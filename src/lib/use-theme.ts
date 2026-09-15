import { useSyncExternalStore } from "react";
import { readTheme, subscribeTheme, type Theme } from "@/lib/theme";

const serverTheme = (): Theme => "dark";

/** The theme currently on <html>. Client components only; the server snapshot is the dark default. */
export function useTheme() {
  return useSyncExternalStore(subscribeTheme, readTheme, serverTheme);
}
