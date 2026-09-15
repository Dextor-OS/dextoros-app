"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { NavIcon } from "@/components/shell/nav-icon";
import { navItems, site } from "@/lib/site";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Left navigation. On phones it slides in as a drawer from the top bar's menu button. */
export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={clsx(
          "fixed inset-0 z-30 bg-void/60 backdrop-blur-sm transition-opacity duration-200 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex w-[var(--sidebar-w)] flex-col border-r border-line bg-void px-3 py-4 transition-transform duration-300 ease-[var(--ease-drawer)] md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Link href="/fleet" aria-label="DextorOS fleet" className="mx-2 mb-6 inline-flex h-9 items-center rounded-tag" onClick={onClose}>
          <Logo />
        </Link>

        <nav aria-label="Main" className="flex flex-1 flex-col gap-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link"
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              onClick={onClose}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </Link>
          ))}
          <div className="mt-auto flex flex-col gap-0.5 border-t border-line pt-3">
            <Link
              href="/settings/team"
              className="nav-link"
              aria-current={isActive(pathname, "/settings") ? "page" : undefined}
              onClick={onClose}
            >
              <NavIcon name="settings" />
              Settings
            </Link>
            <a href={site.docsUrl} target="_blank" rel="noreferrer" className="nav-link">
              <span className="w-[18px]" aria-hidden="true" />
              Docs
            </a>
          </div>
        </nav>
      </aside>
    </>
  );
}
