"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import { CHAIN_STATUS_POLL_INTERVAL_MS } from "@/constants/network";
import { fetchChainStatus } from "@/lib/blockchain/chainStatus";
import type { ChainStatus } from "@/types/blockchain";

interface ChainStatusContextValue {
  status: ChainStatus;
  refresh: () => Promise<void>;
}

const ChainStatusContext = createContext<ChainStatusContextValue | null>(null);

export function ChainStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ChainStatus>({ state: "checking" });

  const refresh = useCallback(async () => {
    const next = await fetchChainStatus();
    setStatus((previous) => (isSameStatus(previous, next) ? previous : next));
  }, []);

  useEffect(() => {
    void refresh();
    const intervalId = setInterval(refresh, CHAIN_STATUS_POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [refresh]);

  return (
    <ChainStatusContext.Provider value={{ status, refresh }}>{children}</ChainStatusContext.Provider>
  );
}

export function useChainStatus(): ChainStatusContextValue {
  const context = useContext(ChainStatusContext);
  if (!context) throw new Error("useChainStatus must be used inside ChainStatusProvider");
  return context;
}

/** Latest block number, or null while the chain is unavailable. Useful as a refresh dependency. */
export function useBlockNumber(): number | null {
  const { status } = useChainStatus();
  return status.state === "online" ? status.blockNumber : null;
}

export function useIsContractReady(): boolean {
  const { status } = useChainStatus();
  return status.state === "online" && status.isContractDeployed;
}

function isSameStatus(previous: ChainStatus, next: ChainStatus): boolean {
  return JSON.stringify(previous) === JSON.stringify(next);
}
