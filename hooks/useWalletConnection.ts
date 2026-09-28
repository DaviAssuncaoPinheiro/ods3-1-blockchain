"use client";

import { useCallback, useEffect, useState } from "react";
import type { JsonRpcSigner } from "ethers";

import { EXPECTED_CHAIN_ID } from "@/lib/contracts/productPass";
import { toUserMessage, UserFacingError } from "@/lib/blockchain/errors";
import {
  getAuthorizedAccounts,
  getInjectedProvider,
  getWalletChainId,
  getWalletSigner,
  requestAccounts,
  requireInjectedProvider,
  revokeAccountAccess,
  switchToLocalNetwork,
} from "@/lib/blockchain/wallet";

type WalletStatus = "checking" | "unavailable" | "disconnected" | "connecting" | "connected";

interface WalletState {
  status: WalletStatus;
  account: string | null;
  chainId: number | null;
  error: string | null;
}

const INITIAL_STATE: WalletState = {
  status: "checking",
  account: null,
  chainId: null,
  error: null,
};

export function useWalletConnection() {
  const [state, setState] = useState<WalletState>(INITIAL_STATE);

  const applyAccounts = useCallback((accounts: string[]) => {
    const [account] = accounts;
    setState((previous) => ({
      ...previous,
      status: account ? "connected" : "disconnected",
      account: account ?? null,
    }));
  }, []);

  useEffect(() => {
    const provider = getInjectedProvider();
    if (!provider) {
      setState({ ...INITIAL_STATE, status: "unavailable" });
      return;
    }

    const handleChainChanged = (chainIdHex: string) =>
      setState((previous) => ({ ...previous, chainId: Number(chainIdHex) }));

    void Promise.all([getAuthorizedAccounts(provider), getWalletChainId(provider)])
      .then(([accounts, chainId]) => {
        setState((previous) => ({ ...previous, chainId }));
        applyAccounts(accounts);
      })
      .catch(() => applyAccounts([]));

    provider.on("accountsChanged", applyAccounts);
    provider.on("chainChanged", handleChainChanged);
    return () => {
      provider.removeListener("accountsChanged", applyAccounts);
      provider.removeListener("chainChanged", handleChainChanged);
    };
  }, [applyAccounts]);

  const connect = useCallback(async () => {
    setState((previous) => ({ ...previous, status: "connecting", error: null }));
    try {
      const provider = requireInjectedProvider();
      const accounts = await requestAccounts(provider);
      const chainId = await getWalletChainId(provider);
      setState((previous) => ({ ...previous, chainId }));
      applyAccounts(accounts);
    } catch (error) {
      setState((previous) => ({ ...previous, status: "disconnected", error: toUserMessage(error) }));
    }
  }, [applyAccounts]);

  const disconnect = useCallback(async () => {
    const provider = getInjectedProvider();
    if (provider) await revokeAccountAccess(provider);
    applyAccounts([]);
  }, [applyAccounts]);

  const switchNetwork = useCallback(async () => {
    try {
      await switchToLocalNetwork(requireInjectedProvider());
      setState((previous) => ({ ...previous, error: null }));
    } catch (error) {
      setState((previous) => ({ ...previous, error: toUserMessage(error) }));
    }
  }, []);

  const isOnExpectedNetwork = state.chainId === EXPECTED_CHAIN_ID;

  const getSigner = useCallback(async (): Promise<JsonRpcSigner> => {
    if (state.status !== "connected") throw new UserFacingError("Conecte sua carteira primeiro.");
    if (!isOnExpectedNetwork) {
      throw new UserFacingError("Troque a MetaMask para a rede local do Hardhat primeiro.");
    }
    return getWalletSigner(requireInjectedProvider());
  }, [state.status, isOnExpectedNetwork]);

  return { ...state, isOnExpectedNetwork, connect, disconnect, switchNetwork, getSigner };
}

export type WalletConnection = ReturnType<typeof useWalletConnection>;
