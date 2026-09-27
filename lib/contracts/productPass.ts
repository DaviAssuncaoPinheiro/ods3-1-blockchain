import { Contract, Interface, type ContractRunner } from "ethers";

import productPassAbi from "./productPassAbi.json";
import deployment from "./deployment.json";

export const PRODUCT_PASS_ADDRESS = deployment.address;
export const EXPECTED_CHAIN_ID = deployment.chainId;
export const DEPLOYMENT_BLOCK = deployment.deploymentBlock;

export const productPassInterface = new Interface(productPassAbi);

export function getProductPassContract(runner: ContractRunner): Contract {
  return new Contract(PRODUCT_PASS_ADDRESS, productPassInterface, runner);
}
