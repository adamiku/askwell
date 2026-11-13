"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavItemActive } from "./is-active";
import { NAV_ITEMS } from "./nav-items";

export function DashboardNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Dashboard" className="min-w-0 flex-1 md:flex-none">
      <ul className="flex gap-1 overflow-x-auto md:flex-col">
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(item.href, pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center rounded-control px-3 text-sm font-medium whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                  active ? "bg-surface-strong text-fg" : "text-fg-muted hover:bg-surface hover:text-fg"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
