import type { Eip1193Provider } from "ethers";

declare global {
  interface InjectedEthereumProvider extends Eip1193Provider {
    isMetaMask?: boolean;
    on(event: "accountsChanged", listener: (accounts: string[]) => void): void;
    on(event: "chainChanged", listener: (chainIdHex: string) => void): void;
    removeListener(event: "accountsChanged", listener: (accounts: string[]) => void): void;
    removeListener(event: "chainChanged", listener: (chainIdHex: string) => void): void;
  }

  interface Window {
    ethereum?: InjectedEthereumProvider;
  }
}

export {};
