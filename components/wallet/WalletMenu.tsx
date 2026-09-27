"use client";

import { describeRoles } from "@/constants/roles";
import { useWallet } from "@/components/providers/WalletProvider";
import { Button } from "@/components/ui/Button";
import { MonoValue } from "@/components/ui/MonoValue";

export function WalletMenu() {
  const wallet = useWallet();

  if (wallet.status === "unavailable" || wallet.status === "checking") return null;

  if (wallet.status !== "connected" || !wallet.account) {
    return (
      <Button onClick={wallet.connect} isLoading={wallet.status === "connecting"}>
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-right leading-tight">
        <MonoValue value={wallet.account} format="address" className="block text-sm" />
        <span className="text-xs text-ink-muted">{describeRoles(wallet.roles)}</span>
      </div>
      <Button variant="secondary" onClick={wallet.disconnect}>
        Disconnect
      </Button>
    </div>
  );
}
