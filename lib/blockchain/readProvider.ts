import { JsonRpcProvider, type Contract } from "ethers";

import { LOCAL_RPC_URL } from "@/constants/network";
import { EXPECTED_CHAIN_ID, getProductPassContract } from "@/lib/contracts/productPass";

let readProvider: JsonRpcProvider | null = null;

export function getReadProvider(): JsonRpcProvider {
  readProvider ??= new JsonRpcProvider(LOCAL_RPC_URL, EXPECTED_CHAIN_ID, { staticNetwork: true });
  return readProvider;
}

export function getReadContract(): Contract {
  return getProductPassContract(getReadProvider());
}
