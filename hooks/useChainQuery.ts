"use client";

import type { DependencyList } from "react";

import { useBlockNumber, useIsContractReady } from "@/components/providers/ChainStatusProvider";

import { useAsyncData, type AsyncData } from "./useAsyncData";

/**
 * Loads contract data once the contract is reachable and reloads it on every new block,
 * so screens reflect confirmed transactions without manual refresh.
 */
export function useChainQuery<T>(
  load: (() => Promise<T>) | null,
  dependencies: DependencyList = [],
): AsyncData<T> {
  const blockNumber = useBlockNumber();
  const isContractReady = useIsContractReady();
  return useAsyncData(isContractReady ? load : null, [
    isContractReady,
    blockNumber,
    ...dependencies,
  ]);
}
