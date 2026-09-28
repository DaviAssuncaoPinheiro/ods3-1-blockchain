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
      <Notice tone="danger" title="A blockchain local não está disponível">
        Inicie-a com <Command>npm run blockchain</Command> e implante o contrato com{" "}
        <Command>npm run setup</Command>.
      </Notice>
    );
  }

  if (status.state === "online" && !status.isContractDeployed) {
    return (
      <Notice tone="warning" title="Contrato ProductPass não encontrado">
        Nenhum contrato em <MonoValue value={PRODUCT_PASS_ADDRESS} format="address" />. Execute{" "}
        <Command>npm run setup</Command> para implantá-lo nesta blockchain.
      </Notice>
    );
  }

  return null;
}

function WalletNotice() {
  const wallet = useWallet();

  if (wallet.status === "unavailable") {
    return (
      <Notice tone="info" title="A MetaMask não está instalada">
        Você ainda pode consultar produtos e navegar pelo explorador. Instale a MetaMask para
        registrar operações.
      </Notice>
    );
  }

  if (wallet.status === "connected" && !wallet.isOnExpectedNetwork) {
    return (
      <Notice
        tone="warning"
        title="A MetaMask está conectada à rede errada"
        action={<Button onClick={wallet.switchNetwork}>Trocar para {LOCAL_NETWORK_NAME}</Button>}
      >
        As transações devem ser enviadas para {LOCAL_NETWORK_NAME} (chain ID {EXPECTED_CHAIN_ID}).
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
