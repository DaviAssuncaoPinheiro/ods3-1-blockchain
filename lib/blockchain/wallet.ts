import { BrowserProvider, toQuantity, type JsonRpcSigner } from "ethers";

import { LOCAL_NETWORK_NAME, LOCAL_RPC_URL, NATIVE_CURRENCY } from "@/constants/network";
import { EXPECTED_CHAIN_ID } from "@/lib/contracts/productPass";

import { UserFacingError } from "./errors";

const UNKNOWN_CHAIN_ERROR_CODE = 4902;

export function getInjectedProvider(): InjectedEthereumProvider | null {
  return typeof window === "undefined" ? null : (window.ethereum ?? null);
}

export function requireInjectedProvider(): InjectedEthereumProvider {
  const provider = getInjectedProvider();
  if (!provider) throw new UserFacingError("MetaMask is not installed in this browser.");
  return provider;
}

export async function requestAccounts(provider: InjectedEthereumProvider): Promise<string[]> {
  return provider.request({ method: "eth_requestAccounts" });
}

export async function getAuthorizedAccounts(provider: InjectedEthereumProvider): Promise<string[]> {
  return provider.request({ method: "eth_accounts" });
}

export async function getWalletChainId(provider: InjectedEthereumProvider): Promise<number> {
  const chainIdHex: string = await provider.request({ method: "eth_chainId" });
  return Number(chainIdHex);
}

export async function switchToLocalNetwork(provider: InjectedEthereumProvider): Promise<void> {
  const chainId = toQuantity(EXPECTED_CHAIN_ID);
  try {
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId }] });
  } catch (error) {
    if (!hasErrorCode(error, UNKNOWN_CHAIN_ERROR_CODE)) throw error;
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId,
          chainName: LOCAL_NETWORK_NAME,
          rpcUrls: [LOCAL_RPC_URL],
          nativeCurrency: NATIVE_CURRENCY,
        },
      ],
    });
  }
}

export async function revokeAccountAccess(provider: InjectedEthereumProvider): Promise<void> {
  try {
    await provider.request({ method: "wallet_revokePermissions", params: [{ eth_accounts: {} }] });
  } catch {
    // Wallets without wallet_revokePermissions keep the grant; the app still clears its own state.
  }
}

export async function getWalletSigner(provider: InjectedEthereumProvider): Promise<JsonRpcSigner> {
  return new BrowserProvider(provider).getSigner();
}

function hasErrorCode(error: unknown, code: number): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}
