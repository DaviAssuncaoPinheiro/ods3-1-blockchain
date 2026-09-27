"use client";

import { useCallback, useState } from "react";
import type { ContractTransactionResponse } from "ethers";

import { toUserMessage } from "@/lib/blockchain/errors";

export type TransactionState =
  | { status: "idle" }
  | { status: "awaitingSignature" }
  | { status: "confirming"; hash: string }
  | { status: "confirmed"; hash: string; blockNumber: number | null }
  | { status: "failed"; message: string };

const IDLE_STATE: TransactionState = { status: "idle" };

export function useTransaction() {
  const [state, setState] = useState<TransactionState>(IDLE_STATE);

  const execute = useCallback(
    async (send: () => Promise<ContractTransactionResponse>): Promise<boolean> => {
      setState({ status: "awaitingSignature" });
      try {
        const transaction = await send();
        setState({ status: "confirming", hash: transaction.hash });
        const receipt = await transaction.wait();
        setState({
          status: "confirmed",
          hash: transaction.hash,
          blockNumber: receipt?.blockNumber ?? null,
        });
        return true;
      } catch (error) {
        setState({ status: "failed", message: toUserMessage(error) });
        return false;
      }
    },
    [],
  );

  const isBusy = state.status === "awaitingSignature" || state.status === "confirming";

  return { state, execute, isBusy };
}
