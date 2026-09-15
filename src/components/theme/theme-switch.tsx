"use client";

import { type CSSProperties, type MouseEvent, useEffect } from "react";
import { applyTheme, readSavedTheme, readTheme } from "@/lib/theme";

// 5x5 pixel glyphs in the logo's grid language. 1 = lit cell.
const MOON = [
  0, 1, 1, 1, 0,
  1, 1, 1, 0, 0,
  1, 1, 0, 0, 0,
  1, 1, 1, 0, 0,
  0, 1, 1, 1, 0,
];
const SUN = [
  1, 0, 1, 0, 1,
  0, 1, 1, 1, 0,
  1, 1, 1, 1, 1,
  0, 1, 1, 1, 0,
  1, 0, 1, 0, 1,
];

const CELL = 3;
const GAP = 1;
const REVEAL_MS = 760;
const EASE_IN_OUT = "cubic-bezier(0.77, 0, 0.175, 1)";

/**
 * Light and dark theme switch. Clicking scans the new theme down the page behind a volt line; keyboard
 * activation and reduced motion switch instantly. Visitors without a saved choice follow their system setting.
 */
export function ThemeSwitch() {
  // Sync the browser chrome color, and keep following the system until the visitor picks a theme.
  useEffect(() => {
    applyTheme(readTheme(), { persist: false });
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const followSystem = () => {
      if (!readSavedTheme()) applyTheme(media.matches ? "light" : "dark", { persist: false });
    };
    media.addEventListener("change", followSystem);
    return () => media.removeEventListener("change", followSystem);
  }, []);

  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    const root = document.documentElement;
    const next = readTheme() === "light" ? "dark" : "light";
    const apply = () => applyTheme(next, { persist: true });

    const fromPointer = event.detail > 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fromPointer || reduced || typeof document.startViewTransition !== "function") {
      apply();
      return;
    }

    const transition = document.startViewTransition(() => {
      root.classList.add("theme-scanning");
      apply();
    });
    transition.ready
      .then(() => {
        const timing = { duration: REVEAL_MS, easing: EASE_IN_OUT };
        root.animate(
          { clipPath: ["inset(0 0 100% 0)", "inset(0 0 0 0)"] },
          { ...timing, pseudoElement: "::view-transition-new(root)" },
        );
        root.animate(
          { transform: ["translateY(0)", `translateY(${window.innerHeight}px)`] },
          { ...timing, pseudoElement: "::view-transition-new(theme-scan)" },
        );
      })
      .catch(() => {});
    transition.finished.finally(() => root.classList.remove("theme-scanning"));
  };

  return (
    <button type="button" className="theme-switch" onClick={toggle}>
      <span className="theme-label-dark sr-only">Switch to light theme</span>
      <span className="theme-label-light sr-only">Switch to dark theme</span>
      <svg width="19" height="19" viewBox="0 0 19 19" aria-hidden="true">
        {MOON.map((_, i) => {
          const x = i % 5;
          const y = Math.floor(i / 5);
          // Cells light up in a ripple from the centre outward.
          const delay = Math.round(Math.hypot(x - 2, y - 2) * 38);
          return (
            <rect
              key={i}
              x={x * (CELL + GAP)}
              y={y * (CELL + GAP)}
              width={CELL}
              height={CELL}
              rx={0.8}
              data-moon={MOON[i] ? "" : undefined}
              data-sun={SUN[i] ? "" : undefined}
              style={{ "--d": `${delay}ms` } as CSSProperties}
            />
          );
        })}
      </svg>
    </button>
  );
}
