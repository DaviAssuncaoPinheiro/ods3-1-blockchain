import { isError } from "ethers";

import { MAX_WARRANTY_MONTHS } from "@/constants/product";
import { ROLE_LABELS, toRole } from "@/constants/roles";
import { productPassInterface } from "@/lib/contracts/productPass";

interface DecodedContractError {
  name: string;
  args: readonly unknown[];
}

const FIELD_LABELS: Record<string, string> = {
  productId: "ID do produto",
  serialNumber: "Número de série",
  name: "Nome do produto",
  model: "Modelo",
  description: "Descrição da manutenção",
  participantName: "Nome do participante",
};

type ErrorFormatter = (args: readonly unknown[]) => string;

const CONTRACT_ERROR_MESSAGES: Record<string, ErrorFormatter> = {
  MissingRole: ([, role]) => `Apenas contas com o papel ${roleLabel(role)} podem fazer isso.`,
  RoleAlreadyGranted: ([, role]) => `Esta conta já possui o papel ${roleLabel(role)}.`,
  InvalidAccount: () => "Informe um endereço de conta válido.",
  EmptyField: ([field]) => `O campo "${fieldLabel(field)}" é obrigatório.`,
  FieldTooLong: ([field, maxLength]) =>
    `O campo "${fieldLabel(field)}" deve ter no máximo ${maxLength} bytes (letras acentuadas contam como 2).`,
  UntrimmedField: ([field]) =>
    `O campo "${fieldLabel(field)}" não pode começar nem terminar com espaços.`,
  ProductAlreadyExists: ([productId]) => `O produto "${productId}" já está registrado.`,
  ProductNotFound: ([productId]) => `O produto "${productId}" não foi encontrado.`,
  ProductAlreadySold: ([productId]) => `O produto "${productId}" já foi vendido.`,
  InvalidWarrantyDuration: () => `A garantia deve ter entre 1 e ${MAX_WARRANTY_MONTHS} meses.`,
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
  return format ? format(decoded.args) : `O contrato rejeitou a operação (${decoded.name}).`;
}

function fieldLabel(field: unknown): string {
  return FIELD_LABELS[String(field)] ?? String(field);
}

function roleLabel(value: unknown): string {
  const role = typeof value === "bigint" || typeof value === "number" ? toRole(value) : null;
  return role === null ? "necessário" : ROLE_LABELS[role];
}
