"use client";

import type { ContractTransactionResponse, Signer } from "ethers";
import type { FormEvent, ReactNode } from "react";

import { LOCAL_NETWORK_NAME } from "@/constants/network";
import { ROLE_LABELS, type Role } from "@/constants/roles";
import { useTransaction } from "@/hooks/useTransaction";
import { useChainStatus } from "@/components/providers/ChainStatusProvider";
import { useWallet } from "@/components/providers/WalletProvider";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";

import { TransactionFeedback } from "./TransactionFeedback";

interface TransactionFormProps {
  requiredRole: Role;
  submitLabel: string;
  onSubmit: (signer: Signer) => Promise<ContractTransactionResponse>;
  successAction?: ReactNode;
  children: ReactNode;
}

export function TransactionForm({
  requiredRole,
  submitLabel,
  onSubmit,
  successAction,
  children,
}: TransactionFormProps) {
  const wallet = useWallet();
  const { refresh } = useChainStatus();
  const { state, execute, isBusy } = useTransaction();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const isConfirmed = await execute(async () => onSubmit(await wallet.getSigner()));
    if (isConfirmed) await refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {children}
      <MissingRoleWarning requiredRole={requiredRole} />
      <div>
        <SubmitControl submitLabel={submitLabel} isBusy={isBusy} />
      </div>
      <TransactionFeedback state={state} successAction={successAction} />
    </form>
  );
}

function SubmitControl({ submitLabel, isBusy }: { submitLabel: string; isBusy: boolean }) {
  const wallet = useWallet();

  if (wallet.status === "unavailable") {
    return <Button disabled>Install MetaMask to continue</Button>;
  }
  if (wallet.status !== "connected") {
    return (
      <Button onClick={wallet.connect} isLoading={wallet.status === "connecting"}>
        Connect Wallet
      </Button>
    );
  }
  if (!wallet.isOnExpectedNetwork) {
    return <Button onClick={wallet.switchNetwork}>Switch to {LOCAL_NETWORK_NAME}</Button>;
  }
  return (
    <Button type="submit" isLoading={isBusy}>
      {submitLabel}
    </Button>
  );
}

function MissingRoleWarning({ requiredRole }: { requiredRole: Role }) {
  const wallet = useWallet();
  const isRelevant = wallet.status === "connected" && wallet.isOnExpectedNetwork;
  if (!isRelevant || wallet.hasRole(requiredRole)) return null;

  return (
    <Notice tone="warning" title={`This account does not have the ${ROLE_LABELS[requiredRole]} role`}>
      The contract will reject this transaction. Switch to an authorized account in MetaMask.
    </Notice>
  );
}
