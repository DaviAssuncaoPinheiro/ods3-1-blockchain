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
    status.state === "online" ? "Online" : status.state === "offline" ? "Offline" : UNKNOWN_VALUE;
  const networkDetail =
    status.state === "online"
      ? `${LOCAL_NETWORK_NAME} · chain ${status.chainId} · block #${status.blockNumber}`
      : "Run npm run blockchain to start it";

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <MetricTile
        label="Total products"
        value={totalProducts.data ?? UNKNOWN_VALUE}
        detail="Registered passports"
      />
      <MetricTile
        label="Total transactions"
        value={totalTransactions ?? UNKNOWN_VALUE}
        detail="Sent to the ProductPass contract"
      />
      <MetricTile label="Blockchain network" value={networkValue} detail={networkDetail} />
    </div>
  );
}
