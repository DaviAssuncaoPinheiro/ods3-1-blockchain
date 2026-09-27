import { isError } from "ethers";

import { MAX_WARRANTY_MONTHS } from "@/constants/product";
import { ROLE_LABELS, toRole } from "@/constants/roles";
import { productPassInterface } from "@/lib/contracts/productPass";

interface DecodedContractError {
  name: string;
  args: readonly unknown[];
}

const FIELD_LABELS: Record<string, string> = {
  productId: "Product ID",
  serialNumber: "Serial number",
  name: "Product name",
  model: "Model",
  description: "Maintenance description",
};

type ErrorFormatter = (args: readonly unknown[]) => string;

const CONTRACT_ERROR_MESSAGES: Record<string, ErrorFormatter> = {
  MissingRole: ([, role]) => `Only accounts with the ${roleLabel(role)} role can do this.`,
  RoleAlreadyGranted: ([, role]) => `This account already has the ${roleLabel(role)} role.`,
  InvalidAccount: () => "Enter a valid account address.",
  EmptyField: ([field]) => `${FIELD_LABELS[String(field)] ?? String(field)} is required.`,
  ProductAlreadyExists: ([productId]) => `Product "${productId}" is already registered.`,
  ProductNotFound: ([productId]) => `Product "${productId}" was not found.`,
  ProductAlreadySold: ([productId]) => `Product "${productId}" has already been sold.`,
  InvalidWarrantyDuration: () => `Warranty must be between 1 and ${MAX_WARRANTY_MONTHS} months.`,
  DescriptionTooLong: ([maxLength]) => `Description must have at most ${maxLength} characters.`,
};

function decodeContractError(error: unknown): DecodedContractError | null {
  if (!isError(error, "CALL_EXCEPTION")) return null;
  if (error.revert) return { name: error.revert.name, args: error.revert.args };
  if (!error.data) return null;

  const parsed = productPassInterface.parseError(error.data);
  return parsed ? { name: parsed.name, args: parsed.args } : null;
}

export function isContractError(error: unknown, name: string): boolean {
  return decodeContractError(error)?.name === name;
}

export function describeContractError(error: unknown): string | null {
  const decoded = decodeContractError(error);
  if (!decoded) return null;
  const format = CONTRACT_ERROR_MESSAGES[decoded.name];
  return format ? format(decoded.args) : `The contract rejected the operation (${decoded.name}).`;
}

function roleLabel(value: unknown): string {
  const role = typeof value === "bigint" || typeof value === "number" ? toRole(value) : null;
  return role === null ? "required" : ROLE_LABELS[role];
}
