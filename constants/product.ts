import type { HistoryEventType, ProductStatus } from "@/types/product";

/** Limits mirror the ProductPass contract. Text limits are in bytes (UTF-8). */
export const MAX_WARRANTY_MONTHS = 120;
export const DEFAULT_WARRANTY_MONTHS = 12;
export const MAX_TEXT_FIELD_LENGTH = 64;
export const MAX_DESCRIPTION_LENGTH = 140;

export const PRODUCT_STATUSES: readonly ProductStatus[] = ["Manufactured", "Sold", "Serviced"];

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  Manufactured: "Fabricado",
  Sold: "Vendido",
  Serviced: "Com manutenção",
};

export const HISTORY_EVENT_TYPES: readonly HistoryEventType[] = [
  "Registered",
  "Sold",
  "Maintenance",
];

export const HISTORY_EVENT_LABELS: Record<HistoryEventType, string> = {
  Registered: "Produto registrado",
  Sold: "Produto vendido",
  Maintenance: "Manutenção registrada",
};
