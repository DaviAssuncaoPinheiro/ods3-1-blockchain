"use client";

import type { ReactNode } from "react";

import { ChainStatusProvider } from "./ChainStatusProvider";
import { ParticipantsProvider } from "./ParticipantsProvider";
import { WalletProvider } from "./WalletProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ChainStatusProvider>
      <ParticipantsProvider>
        <WalletProvider>{children}</WalletProvider>
      </ParticipantsProvider>
    </ChainStatusProvider>
  );
}
