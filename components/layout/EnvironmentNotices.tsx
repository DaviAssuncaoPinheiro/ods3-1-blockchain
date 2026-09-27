"use client";

import { LOCAL_NETWORK_NAME } from "@/constants/network";
import { EXPECTED_CHAIN_ID, PRODUCT_PASS_ADDRESS } from "@/lib/contracts/productPass";
import { useChainStatus } from "@/components/providers/ChainStatusProvider";
import { useWallet } from "@/components/providers/WalletProvider";
import { Button } from "@/components/ui/Button";
import { MonoValue } from "@/components/ui/MonoValue";
import { Notice } from "@/components/ui/Notice";

export function EnvironmentNotices() {
  return (
    <div className="flex flex-col gap-3 empty:hidden">
      <ChainNotice />
      <WalletNotice />
    </div>
  );
}

function ChainNotice() {
  const { status } = useChainStatus();

  if (status.state === "offline") {
    return (
      <Notice tone="danger" title="The local blockchain is not available">
        Start it with <Command>npm run blockchain</Command> and deploy the contract with{" "}
        <Command>npm run setup</Command>.
      </Notice>
    );
  }

  if (status.state === "online" && !status.isContractDeployed) {
    return (
      <Notice tone="warning" title="ProductPass contract not found">
        No contract at <MonoValue value={PRODUCT_PASS_ADDRESS} format="address" />. Run{" "}
        <Command>npm run setup</Command> to deploy it on this blockchain.
      </Notice>
    );
  }

  return null;
}

function WalletNotice() {
  const wallet = useWallet();

  if (wallet.status === "unavailable") {
    return (
      <Notice tone="info" title="MetaMask is not installed">
        You can still look up products and browse the explorer. Install MetaMask to register
        operations.
      </Notice>
    );
  }

  if (wallet.status === "connected" && !wallet.isOnExpectedNetwork) {
    return (
      <Notice
        tone="warning"
        title="MetaMask is connected to the wrong network"
        action={<Button onClick={wallet.switchNetwork}>Switch to {LOCAL_NETWORK_NAME}</Button>}
      >
        Transactions must be sent to {LOCAL_NETWORK_NAME} (chain ID {EXPECTED_CHAIN_ID}).
      </Notice>
    );
  }

  if (wallet.error) {
    return <Notice tone="danger" title={wallet.error} />;
  }

  return null;
}

function Command({ children }: { children: string }) {
  return <code className="rounded-md bg-surface/70 px-1.5 py-0.5 font-mono text-xs">{children}</code>;
}
