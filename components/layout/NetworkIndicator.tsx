"use client";

import { LOCAL_NETWORK_NAME } from "@/constants/network";
import { useChainStatus } from "@/components/providers/ChainStatusProvider";

const INDICATOR_CLASSES = {
  online: "bg-success",
  offline: "bg-danger",
  checking: "bg-line",
} as const;

export function NetworkIndicator() {
  const { status } = useChainStatus();
  const label =
    status.state === "online"
      ? `${LOCAL_NETWORK_NAME} · bloco ${status.blockNumber}`
      : status.state === "offline"
        ? "Blockchain fora do ar"
        : "Verificando a rede…";

  return (
    <p className="flex items-center gap-2 text-sm text-ink-muted" aria-live="polite">
      <span className={`size-2 rounded-full ${INDICATOR_CLASSES[status.state]}`} aria-hidden="true" />
      {label}
    </p>
  );
}
