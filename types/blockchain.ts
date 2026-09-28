export interface BlockSummary {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: Date;
  transactionCount: number;
}

export type ApplicationEventName =
  | "RoleGranted"
  | "ProductRegistered"
  | "ProductSold"
  | "MaintenanceRegistered";

export interface ApplicationTransaction {
  id: string;
  transactionHash: string;
  blockNumber: number;
  eventName: ApplicationEventName;
  summary: string;
  actor: string;
}

export type ChainStatus =
  | { state: "checking" }
  | { state: "offline" }
  | { state: "online"; chainId: number; blockNumber: number; isContractDeployed: boolean };

export interface RoleGrant {
  account: string;
  participantName: string;
  roleLabel: string;
  grantedBy: string;
  blockNumber: number;
  transactionHash: string;
}
