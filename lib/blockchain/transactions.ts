import type { ContractTransactionResponse, Signer } from "ethers";

import type { Role } from "@/constants/roles";
import { getProductPassContract } from "@/lib/contracts/productPass";

export interface RegisterProductInput {
  productId: string;
  serialNumber: string;
  name: string;
  model: string;
}

export interface RegisterSaleInput {
  productId: string;
  warrantyMonths: number;
}

export interface RegisterMaintenanceInput {
  productId: string;
  description: string;
}

export interface GrantRoleInput {
  account: string;
  role: Role;
}

export function registerProduct(
  signer: Signer,
  { productId, serialNumber, name, model }: RegisterProductInput,
): Promise<ContractTransactionResponse> {
  return getProductPassContract(signer).registerProduct(productId, serialNumber, name, model);
}

export function registerSale(
  signer: Signer,
  { productId, warrantyMonths }: RegisterSaleInput,
): Promise<ContractTransactionResponse> {
  return getProductPassContract(signer).registerSale(productId, warrantyMonths);
}

export function registerMaintenance(
  signer: Signer,
  { productId, description }: RegisterMaintenanceInput,
): Promise<ContractTransactionResponse> {
  return getProductPassContract(signer).registerMaintenance(productId, description);
}

export function grantRole(
  signer: Signer,
  { account, role }: GrantRoleInput,
): Promise<ContractTransactionResponse> {
  return getProductPassContract(signer).grantRole(account, role);
}
