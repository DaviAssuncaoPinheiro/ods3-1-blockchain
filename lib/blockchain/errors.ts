import { isError } from "ethers";

import { describeContractError } from "./contractErrors";

const METAMASK_REQUEST_PENDING_CODE = -32002;
const FALLBACK_MESSAGE = "Algo deu errado. Tente novamente.";

export class UserFacingError extends Error {}

export function toUserMessage(error: unknown): string {
  if (error instanceof UserFacingError) return error.message;
  if (isError(error, "ACTION_REJECTED") || hasCode(error, 4001)) {
    return "A solicitação foi recusada na carteira.";
  }
  if (hasCode(error, METAMASK_REQUEST_PENDING_CODE)) {
    return "Já existe uma solicitação aberta na carteira. Verifique a MetaMask.";
  }

  const contractMessage = describeContractError(error);
  if (contractMessage) return contractMessage;

  if (isError(error, "NETWORK_ERROR") || isError(error, "SERVER_ERROR") || isFetchFailure(error)) {
    return "A blockchain local não está acessível. Inicie-a com npm run blockchain.";
  }
  if (isError(error, "CALL_EXCEPTION")) return "O contrato rejeitou a operação.";
  return FALLBACK_MESSAGE;
}

function hasCode(error: unknown, code: number): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}

function isFetchFailure(error: unknown): boolean {
  return error instanceof TypeError && error.message.toLowerCase().includes("fetch");
}
