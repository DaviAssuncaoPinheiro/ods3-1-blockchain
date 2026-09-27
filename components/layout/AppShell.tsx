import Link from "next/link";
import type { ReactNode } from "react";

import { ROUTES } from "@/constants/routes";
import { WalletMenu } from "@/components/wallet/WalletMenu";

import { EnvironmentNotices } from "./EnvironmentNotices";
import { NetworkIndicator } from "./NetworkIndicator";
import { SidebarNav } from "./SidebarNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-6 px-4 pt-5 pb-3 md:sticky md:top-0 md:h-dvh md:px-4 md:py-6">
        <Link href={ROUTES.dashboard} className="px-3 text-lg font-semibold tracking-tight">
          Product<span className="text-accent">Pass</span>
        </Link>
        <SidebarNav />
      </aside>

      <div className="mx-auto flex w-full max-w-5xl min-w-0 flex-col px-4 pb-16 md:px-10 md:box-content">
        <header className="flex flex-wrap items-center justify-between gap-4 py-5">
          <NetworkIndicator />
          <WalletMenu />
        </header>
        <EnvironmentNotices />
        <main className="pt-8">{children}</main>
      </div>
    </div>
  );
}
