/*
  Theme preference. Dark is the brand default; a visitor with no saved choice follows their system setting.
  No React here, so the root layout (a Server Component) can import the startup script.
*/

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "dextoros-theme";

/** Browser chrome color per theme (the page ground). */
export const THEME_COLORS: Record<Theme, string> = { dark: "#0c0a15", light: "#f3f2fb" };

/** Runs in <head> before first paint: saved choice first, then the system setting. */
export const THEME_SCRIPT = `(function(){var d=document.documentElement,t="dark";try{var s=localStorage.getItem("${THEME_STORAGE_KEY}");t=s==="light"||s==="dark"?s:(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark")}catch(e){}d.setAttribute("data-theme",t);d.style.colorScheme=t})()`;

export function readTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function readSavedTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null;
  }
}

/** Apply a theme to the page, and remember it unless it only follows the system setting. */
export function applyTheme(theme: Theme, { persist }: { persist: boolean }) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  if (persist) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Private mode or blocked storage: the choice lasts for this visit only.
    }
  }
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.setAttribute("content", THEME_COLORS[theme]));
}

/** Notifies when data-theme changes on <html>, whoever changed it. */
export function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
