"use client";

import { LOCAL_NETWORK_NAME } from "@/constants/network";
import { useChainQuery } from "@/hooks/useChainQuery";
import { fetchTotalProducts } from "@/lib/blockchain/products";
import { useChainStatus } from "@/components/providers/ChainStatusProvider";

import { MetricTile } from "./MetricTile";

const UNKNOWN_VALUE = "—";

export function NetworkMetrics({ totalTransactions }: { totalTransactions: number | null }) {
  const { status } = useChainStatus();
  const totalProducts = useChainQuery(fetchTotalProducts);

  const networkValue =
    status.state === "online" ? "No ar" : status.state === "offline" ? "Fora do ar" : UNKNOWN_VALUE;
  const networkDetail =
    status.state === "online"
      ? `${LOCAL_NETWORK_NAME} · chain ${status.chainId} · bloco #${status.blockNumber}`
      : "Execute npm run blockchain para iniciá-la";

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <MetricTile
        label="Total de produtos"
        value={totalProducts.data ?? UNKNOWN_VALUE}
        detail="Passaportes registrados"
      />
      <MetricTile
        label="Total de transações"
        value={totalTransactions ?? UNKNOWN_VALUE}
        detail="Enviadas ao contrato ProductPass"
      />
      <MetricTile label="Rede blockchain" value={networkValue} detail={networkDetail} />
    </div>
  );
}
