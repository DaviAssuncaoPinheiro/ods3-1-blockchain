export const LOCAL_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL ?? "http://127.0.0.1:8545";
export const LOCAL_NETWORK_NAME = "Hardhat Local";
export const NATIVE_CURRENCY = { name: "Ether", symbol: "ETH", decimals: 18 };
export const CHAIN_STATUS_POLL_INTERVAL_MS = 4_000;
