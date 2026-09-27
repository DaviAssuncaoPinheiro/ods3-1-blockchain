import { PRODUCT_PASS_ADDRESS } from "@/lib/contracts/productPass";
import type { ChainStatus } from "@/types/blockchain";

import { getReadProvider } from "./readProvider";

const EMPTY_BYTECODE = "0x";

export async function fetchChainStatus(): Promise<ChainStatus> {
  const provider = getReadProvider();
  try {
    const [chainIdHex, blockNumber, bytecode] = await Promise.all([
      provider.send("eth_chainId", []) as Promise<string>,
      provider.getBlockNumber(),
      provider.getCode(PRODUCT_PASS_ADDRESS),
    ]);
    return {
      state: "online",
      chainId: Number(chainIdHex),
      blockNumber,
      isContractDeployed: bytecode !== EMPTY_BYTECODE,
    };
  } catch {
    return { state: "offline" };
  }
}
