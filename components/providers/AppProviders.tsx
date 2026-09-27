"use client";

import type { ReactNode } from "react";

import { ChainStatusProvider } from "./ChainStatusProvider";
import { WalletProvider } from "./WalletProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ChainStatusProvider>
      <WalletProvider>{children}</WalletProvider>
    </ChainStatusProvider>
  );
}
