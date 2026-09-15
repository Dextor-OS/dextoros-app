"use client";

import { List, Plus } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { LiveCount } from "@/components/shell/live-count";
import { ThemeSwitch } from "@/components/theme/theme-switch";

/** Top bar: menu button on phones, the live count and the primary action. */
export function TopBar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-void/80 px-4 backdrop-blur-md md:px-6">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open navigation"
        className="btn btn-ghost btn-sm w-9 px-0 md:hidden"
      >
        <List size={18} aria-hidden="true" />
      </button>

      <LiveCount />

      <div className="ml-auto flex items-center gap-2">
        <ThemeSwitch />
        <Link href="/robots/new" className="btn btn-primary btn-sm">
          <Plus size={14} weight="bold" aria-hidden="true" />
          Connect a robot
        </Link>
      </div>
    </header>
  );
}
