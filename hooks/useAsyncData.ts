"use client";

import { useEffect, useState, type DependencyList } from "react";

import { toUserMessage } from "@/lib/blockchain/errors";

export interface AsyncData<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

interface AsyncState<T> {
  status: "idle" | "loading" | "settled";
  data: T | null;
  error: string | null;
}

const IDLE_STATE: AsyncState<never> = { status: "idle", data: null, error: null };

/**
 * Runs `load` whenever a dependency changes (callers own the dependency list).
 * Pass `null` to skip loading. Previous data is kept while reloading so polling does not flicker.
 */
export function useAsyncData<T>(
  load: (() => Promise<T>) | null,
  dependencies: DependencyList,
): AsyncData<T> {
  const [state, setState] = useState<AsyncState<T>>(IDLE_STATE);

  useEffect(() => {
    if (!load) {
      setState(IDLE_STATE);
      return;
    }

    let isCancelled = false;
    setState((previous) => ({ ...previous, status: "loading" }));
    load().then(
      (data) => !isCancelled && setState({ status: "settled", data, error: null }),
      (error: unknown) =>
        !isCancelled && setState({ status: "settled", data: null, error: toUserMessage(error) }),
    );

    return () => {
      isCancelled = true;
    };
  }, dependencies);

  const isAwaitingFirstLoad = load !== null && state.status === "idle";
  return {
    data: state.data,
    error: state.error,
    isLoading: state.status === "loading" || isAwaitingFirstLoad,
  };
}
