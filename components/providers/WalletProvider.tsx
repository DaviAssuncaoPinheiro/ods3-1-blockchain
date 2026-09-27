"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { Role } from "@/constants/roles";
import { useChainQuery } from "@/hooks/useChainQuery";
import { useWalletConnection, type WalletConnection } from "@/hooks/useWalletConnection";
import { fetchAccountRoles } from "@/lib/blockchain/roles";

interface WalletContextValue extends WalletConnection {
  roles: Role[];
  hasRole: (role: Role) => boolean;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const connection = useWalletConnection();
  const { account } = connection;
  const { data: roles } = useChainQuery(account ? () => fetchAccountRoles(account) : null, [
    account,
  ]);

  const accountRoles = roles ?? [];
  const value: WalletContextValue = {
    ...connection,
    roles: accountRoles,
    hasRole: (role) => accountRoles.includes(role),
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used inside WalletProvider");
  return context;
}
