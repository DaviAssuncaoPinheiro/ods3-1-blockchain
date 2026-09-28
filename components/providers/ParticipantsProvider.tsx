"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { AsyncData } from "@/hooks/useAsyncData";
import { useChainQuery } from "@/hooks/useChainQuery";
import { fetchRoleGrants, toParticipantNames } from "@/lib/blockchain/roles";
import type { RoleGrant } from "@/types/blockchain";

interface ParticipantsContextValue {
  grants: AsyncData<RoleGrant[]>;
  /** Registered name of the address, or null when it never received a role. */
  nameOf: (address: string) => string | null;
}

const ParticipantsContext = createContext<ParticipantsContextValue | null>(null);

/** Loads the RoleGranted events once per block and shares the participant names with every screen. */
export function ParticipantsProvider({ children }: { children: ReactNode }) {
  const { data, error, isLoading } = useChainQuery(fetchRoleGrants);

  const value = useMemo<ParticipantsContextValue>(() => {
    const names = toParticipantNames(data ?? []);
    return {
      grants: { data, error, isLoading },
      nameOf: (address) => names.get(address.toLowerCase()) ?? null,
    };
  }, [data, error, isLoading]);

  return <ParticipantsContext.Provider value={value}>{children}</ParticipantsContext.Provider>;
}

export function useParticipants(): ParticipantsContextValue {
  const context = useContext(ParticipantsContext);
  if (!context) throw new Error("useParticipants must be used inside ParticipantsProvider");
  return context;
}
