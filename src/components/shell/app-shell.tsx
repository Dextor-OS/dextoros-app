"use client";

import { type ReactNode, useState } from "react";
import { FleetProvider } from "@/components/fleet/fleet-provider";
import { Sidebar } from "@/components/shell/sidebar";
import { TopBar } from "@/components/shell/top-bar";

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-dvh md:pl-[var(--sidebar-w)]">
      <FleetProvider />
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <TopBar onMenu={() => setOpen(true)} />
      <main className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-6 md:py-8">{children}</main>
    </div>
  );
}
