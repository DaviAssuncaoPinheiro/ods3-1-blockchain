import type { Product, WarrantyStatus } from "@/types/product";

export function getWarrantyStatus(product: Product, now: Date = new Date()): WarrantyStatus {
  if (!product.warrantyExpiresAt) return "NotStarted";
  return product.warrantyExpiresAt > now ? "Active" : "Expired";
}
