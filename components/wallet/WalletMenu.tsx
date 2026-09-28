"use client";

import { describeRoles } from "@/constants/roles";
import { useParticipants } from "@/components/providers/ParticipantsProvider";
import { useWallet } from "@/components/providers/WalletProvider";
import { Button } from "@/components/ui/Button";
import { MonoValue } from "@/components/ui/MonoValue";

export function WalletMenu() {
  const wallet = useWallet();
  const { nameOf } = useParticipants();

  if (wallet.status === "unavailable" || wallet.status === "checking") return null;

  if (wallet.status !== "connected" || !wallet.account) {
    return (
      <Button onClick={wallet.connect} isLoading={wallet.status === "connecting"}>
        Conectar carteira
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-right leading-tight">
        <span className="block text-sm font-medium">{nameOf(wallet.account) ?? "Conta sem nome"}</span>
        <span className="block text-xs text-ink-muted">
          <MonoValue value={wallet.account} format="address" /> · {describeRoles(wallet.roles)}
        </span>
      </div>
      <Button variant="secondary" onClick={wallet.disconnect}>
        Desconectar
      </Button>
    </div>
  );
}
