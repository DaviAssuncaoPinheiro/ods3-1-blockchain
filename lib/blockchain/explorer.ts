import type { LogDescription } from "ethers";

import { ROLE_LABELS, toRole } from "@/constants/roles";
import {
  DEPLOYMENT_BLOCK,
  PRODUCT_PASS_ADDRESS,
  productPassInterface,
} from "@/lib/contracts/productPass";
import { shortenAddress } from "@/lib/utils/format";
import { fromUnixSeconds } from "@/lib/utils/time";
import type {
  ApplicationEventName,
  ApplicationTransaction,
  BlockSummary,
} from "@/types/blockchain";

import { getReadProvider } from "./readProvider";

type EventDescriber = (args: LogDescription["args"]) => { summary: string; actor: string };

const EVENT_DESCRIBERS: Record<ApplicationEventName, EventDescriber> = {
  RoleGranted: (args) => ({
    summary: `Granted ${roleLabel(args.role)} role to ${shortenAddress(args.account)}`,
    actor: args.grantedBy,
  }),
  ProductRegistered: (args) => ({
    summary: `Registered product ${args.productId}`,
    actor: args.manufacturer,
  }),
  ProductSold: (args) => ({
    summary: `Sold product ${args.productId}`,
    actor: args.retailer,
  }),
  MaintenanceRegistered: (args) => ({
    summary: `Maintenance on product ${args.productId}`,
    actor: args.serviceCenter,
  }),
};

export async function fetchLatestBlocks(count: number): Promise<BlockSummary[]> {
  const provider = getReadProvider();
  const latestBlockNumber = await provider.getBlockNumber();
  const blockNumbers = Array.from(
    { length: Math.min(count, latestBlockNumber + 1) },
    (_, offset) => latestBlockNumber - offset,
  );

  const blocks = await Promise.all(blockNumbers.map((number) => provider.getBlock(number)));
  return blocks.flatMap((block) => {
    if (!block?.hash) return [];
    return [
      {
        number: block.number,
        hash: block.hash,
        parentHash: block.parentHash,
        timestamp: fromUnixSeconds(block.timestamp),
        transactionCount: block.transactions.length,
      },
    ];
  });
}

export async function fetchApplicationTransactions(): Promise<ApplicationTransaction[]> {
  const logs = await getReadProvider().getLogs({
    address: PRODUCT_PASS_ADDRESS,
    fromBlock: DEPLOYMENT_BLOCK,
  });

  const transactions = logs.flatMap((log) => {
    const parsed = productPassInterface.parseLog(log);
    if (!parsed || !isApplicationEvent(parsed.name)) return [];
    return [
      {
        id: `${log.transactionHash}-${log.index}`,
        transactionHash: log.transactionHash,
        blockNumber: log.blockNumber,
        eventName: parsed.name,
        ...EVENT_DESCRIBERS[parsed.name](parsed.args),
      },
    ];
  });

  return transactions.reverse();
}

export function countUniqueTransactions(transactions: ApplicationTransaction[]): number {
  return new Set(transactions.map((transaction) => transaction.transactionHash)).size;
}

function isApplicationEvent(name: string): name is ApplicationEventName {
  return name in EVENT_DESCRIBERS;
}

function roleLabel(value: bigint): string {
  const role = toRole(value);
  return role === null ? "unknown" : ROLE_LABELS[role];
}
