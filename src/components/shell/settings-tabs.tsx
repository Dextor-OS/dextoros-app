"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { settingsItems } from "@/lib/site";

export function SettingsTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Settings" className="mb-6 flex gap-1 border-b border-line">
      {settingsItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "-mb-px border-b-2 px-3 py-2.5 text-sm transition-[color] duration-150",
              active ? "border-fog text-fog" : "border-transparent text-haze hover:text-fog",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
