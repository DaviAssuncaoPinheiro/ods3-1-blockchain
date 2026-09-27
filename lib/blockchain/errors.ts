import { isError } from "ethers";

import { describeContractError } from "./contractErrors";

const METAMASK_REQUEST_PENDING_CODE = -32002;
const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

export class UserFacingError extends Error {}

export function toUserMessage(error: unknown): string {
  if (error instanceof UserFacingError) return error.message;
  if (isError(error, "ACTION_REJECTED") || hasCode(error, 4001)) {
    return "The request was rejected in the wallet.";
  }
  if (hasCode(error, METAMASK_REQUEST_PENDING_CODE)) {
    return "A wallet request is already open. Check MetaMask.";
  }

  const contractMessage = describeContractError(error);
  if (contractMessage) return contractMessage;

  if (isError(error, "NETWORK_ERROR") || isError(error, "SERVER_ERROR") || isFetchFailure(error)) {
    return "The local blockchain is not reachable. Start it with npm run blockchain.";
  }
  if (isError(error, "CALL_EXCEPTION")) return "The contract rejected the operation.";
  return FALLBACK_MESSAGE;
}

function hasCode(error: unknown, code: number): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}

function isFetchFailure(error: unknown): boolean {
  return error instanceof TypeError && error.message.toLowerCase().includes("fetch");
}
