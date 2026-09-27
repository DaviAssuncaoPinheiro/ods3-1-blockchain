import type { ReactNode } from "react";

import type { TransactionState } from "@/hooks/useTransaction";
import { MonoValue } from "@/components/ui/MonoValue";
import { Notice } from "@/components/ui/Notice";
import { SpinnerIcon } from "@/components/ui/icons";

interface TransactionFeedbackProps {
  state: TransactionState;
  successAction?: ReactNode;
}

export function TransactionFeedback({ state, successAction }: TransactionFeedbackProps) {
  switch (state.status) {
    case "idle":
      return null;
    case "awaitingSignature":
      return <Progress label="Confirm the transaction in MetaMask…" />;
    case "confirming":
      return <Progress label="Waiting for the block confirmation…" hash={state.hash} />;
    case "confirmed":
      return (
        <Notice
          tone="success"
          title={
            state.blockNumber === null
              ? "Transaction confirmed"
              : `Transaction confirmed in block ${state.blockNumber}`
          }
          action={successAction}
        >
          <span className="text-ink-muted">Transaction hash </span>
          <MonoValue value={state.hash} />
        </Notice>
      );
    case "failed":
      return (
        <Notice tone="danger" title="Operation rejected">
          {state.message}
        </Notice>
      );
  }
}

function Progress({ label, hash }: { label: string; hash?: string }) {
  return (
    <div role="status" className="flex items-start gap-3 rounded-xl bg-sunken px-4 py-3 text-sm">
      <SpinnerIcon className="mt-0.5 shrink-0 text-accent" />
      <div className="min-w-0">
        <p className="font-medium">{label}</p>
        {hash && <MonoValue value={hash} className="mt-1 block text-ink-muted" />}
      </div>
    </div>
  );
}
