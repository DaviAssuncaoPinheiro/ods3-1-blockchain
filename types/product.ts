export type ProductStatus = "Manufactured" | "Sold" | "Serviced";

export type HistoryEventType = "Registered" | "Sold" | "Maintenance";

export type WarrantyStatus = "NotStarted" | "Active" | "Expired";

export interface Product {
  productId: string;
  serialNumber: string;
  name: string;
  model: string;
  manufacturer: string;
  manufacturedAt: Date;
  soldAt: Date | null;
  warrantyExpiresAt: Date | null;
  status: ProductStatus;
  maintenanceCount: number;
}

export interface ProductHistoryEvent {
  type: HistoryEventType;
  actor: string;
  timestamp: Date;
  details: string;
  transactionHash: string | null;
}

export interface ProductPassport {
  product: Product;
  history: ProductHistoryEvent[];
}
