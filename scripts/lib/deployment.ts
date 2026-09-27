import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import hre from "hardhat";

import type { ProductPass } from "../../typechain-types/index.js";

const CONTRACT_NAME = "ProductPass";
const FRONTEND_CONTRACTS_DIR = path.join(import.meta.dirname, "..", "..", "lib", "contracts");

type Connection = Awaited<ReturnType<typeof hre.network.getOrCreate>>;

export interface DeploymentInfo {
  address: string;
  chainId: number;
  deploymentBlock: number;
}

export async function connectToNetwork(): Promise<Connection> {
  const connection = await hre.network.getOrCreate();
  try {
    await connection.ethers.provider.getBlockNumber();
  } catch {
    throw new Error(
      `Blockchain "${connection.networkName}" is not reachable. Start it with "npm run blockchain".`,
    );
  }
  return connection;
}

export async function deployProductPass(connection: Connection): Promise<ProductPass> {
  const productPass = await connection.ethers.deployContract(CONTRACT_NAME);
  await productPass.waitForDeployment();

  const receipt = await productPass.deploymentTransaction()?.wait();
  const network = await connection.ethers.provider.getNetwork();
  const deployment: DeploymentInfo = {
    address: await productPass.getAddress(),
    chainId: Number(network.chainId),
    deploymentBlock: receipt?.blockNumber ?? 0,
  };

  await saveFrontendFiles(deployment);
  console.log(`ProductPass deployed at ${deployment.address} (chain ${deployment.chainId})`);
  return productPass;
}

async function saveFrontendFiles(deployment: DeploymentInfo): Promise<void> {
  const artifact = await hre.artifacts.readArtifact(CONTRACT_NAME);
  await mkdir(FRONTEND_CONTRACTS_DIR, { recursive: true });
  await writeJson("deployment.json", deployment);
  await writeJson("productPassAbi.json", artifact.abi);
}

async function writeJson(fileName: string, data: unknown): Promise<void> {
  const filePath = path.join(FRONTEND_CONTRACTS_DIR, fileName);
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`);
}
