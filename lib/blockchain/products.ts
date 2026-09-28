import { id as hashText } from "ethers";

import { HISTORY_EVENT_TYPES, PRODUCT_STATUSES } from "@/constants/product";
import {
  DEPLOYMENT_BLOCK,
  PRODUCT_PASS_ADDRESS,
  productPassInterface,
} from "@/lib/contracts/productPass";
import { fromOptionalUnixSeconds, fromUnixSeconds } from "@/lib/utils/time";
import type {
  HistoryEventType,
  Product,
  ProductHistoryEvent,
  ProductPassport,
} from "@/types/product";

import { isContractError } from "./contractErrors";
import { getReadContract, getReadProvider } from "./readProvider";

interface RawProduct {
  productId: string;
  serialNumber: string;
  name: string;
  model: string;
  manufacturer: string;
  manufacturedAt: bigint;
  soldAt: bigint;
  warrantyExpiresAt: bigint;
  status: bigint;
  maintenanceCount: bigint;
}

interface RawHistoryEntry {
  eventType: bigint;
  status: bigint;
  actor: string;
  timestamp: bigint;
  details: string;
}

interface HistoryTransaction {
  type: HistoryEventType;
  transactionHash: string;
}

const HISTORY_TYPE_BY_TOPIC = new Map<string, HistoryEventType>([
  [topicOf("ProductRegistered"), "Registered"],
  [topicOf("ProductSold"), "Sold"],
  [topicOf("MaintenanceRegistered"), "Maintenance"],
]);

async function fetchProduct(productId: string): Promise<Product | null> {
  try {
    const rawProduct: RawProduct = await getReadContract().getProduct(productId);
    return toProduct(rawProduct);
  } catch (error) {
    if (isContractError(error, "ProductNotFound")) return null;
    throw error;
  }
}

export async function fetchProductPassport(productId: string): Promise<ProductPassport | null> {
  const product = await fetchProduct(productId);
  if (!product) return null;
  return { product, history: await fetchProductHistory(productId) };
}

export async function fetchTotalProducts(): Promise<number> {
  const total: bigint = await getReadContract().totalProducts();
  return Number(total);
}

async function fetchProductHistory(productId: string): Promise<ProductHistoryEvent[]> {
  const [entries, transactions] = await Promise.all([
    getReadContract().getProductHistory(productId) as Promise<RawHistoryEntry[]>,
    fetchHistoryTransactions(productId),
  ]);

  return entries.map((entry, index) => {
    const event = toHistoryEvent(entry);
    const transaction = transactions[index];
    const transactionHash = transaction?.type === event.type ? transaction.transactionHash : null;
    return { ...event, transactionHash };
  });
}

async function fetchHistoryTransactions(productId: string): Promise<HistoryTransaction[]> {
  const logs = await getReadProvider().getLogs({
    address: PRODUCT_PASS_ADDRESS,
    fromBlock: DEPLOYMENT_BLOCK,
    topics: [[...HISTORY_TYPE_BY_TOPIC.keys()], hashText(productId)],
  });

  return logs.flatMap((log) => {
    const type = HISTORY_TYPE_BY_TOPIC.get(log.topics[0]);
    return type ? [{ type, transactionHash: log.transactionHash }] : [];
  });
}

function toProduct(raw: RawProduct): Product {
  return {
    productId: raw.productId,
    serialNumber: raw.serialNumber,
    name: raw.name,
    model: raw.model,
    manufacturer: raw.manufacturer,
    manufacturedAt: fromUnixSeconds(raw.manufacturedAt),
    soldAt: fromOptionalUnixSeconds(raw.soldAt),
    warrantyExpiresAt: fromOptionalUnixSeconds(raw.warrantyExpiresAt),
    status: PRODUCT_STATUSES[Number(raw.status)],
    maintenanceCount: Number(raw.maintenanceCount),
  };
}

function toHistoryEvent(raw: RawHistoryEntry): Omit<ProductHistoryEvent, "transactionHash"> {
  return {
    type: HISTORY_EVENT_TYPES[Number(raw.eventType)],
    status: PRODUCT_STATUSES[Number(raw.status)],
    actor: raw.actor,
    timestamp: fromUnixSeconds(raw.timestamp),
    details: raw.details,
  };
}

function topicOf(eventName: string): string {
  const event = productPassInterface.getEvent(eventName);
  if (!event) throw new Error(`Event ${eventName} is missing from the ProductPass ABI`);
  return event.topicHash;
}
