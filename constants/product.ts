import type { HistoryEventType, ProductStatus } from "@/types/product";

export const MAX_WARRANTY_MONTHS = 120;
export const DEFAULT_WARRANTY_MONTHS = 12;
export const MAX_DESCRIPTION_LENGTH = 140;

export const PRODUCT_STATUSES: readonly ProductStatus[] = ["Manufactured", "Sold", "Serviced"];

export const HISTORY_EVENT_TYPES: readonly HistoryEventType[] = [
  "Registered",
  "Sold",
  "Maintenance",
];

export const HISTORY_EVENT_LABELS: Record<HistoryEventType, string> = {
  Registered: "Product Registered",
  Sold: "Product Sold",
  Maintenance: "Maintenance Registered",
};

export const MAX_TEXT_FIELD_LENGTH = 64;
