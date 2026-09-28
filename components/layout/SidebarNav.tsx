"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAVIGATION } from "./navigation";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Principal" className="flex gap-6 overflow-x-auto md:flex-col md:overflow-visible">
      {NAVIGATION.map((group) => (
        <div key={group.title} className="shrink-0">
          <p className="mb-2 hidden px-3 text-xs font-medium text-ink-muted md:block">
            {group.title}
          </p>
          <ul className="flex gap-1 md:flex-col">
            {group.items.map(({ href, label, icon: NavIcon }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm whitespace-nowrap transition-colors ${
                      isActive
                        ? "bg-surface font-medium text-ink shadow-panel"
                        : "text-ink-muted hover:bg-sunken hover:text-ink"
                    }`}
                  >
                    <NavIcon className={isActive ? "text-accent" : undefined} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
