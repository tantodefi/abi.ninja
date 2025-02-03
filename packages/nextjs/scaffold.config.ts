import * as chains from "viem/chains";

export type ScaffoldConfig = {
  targetNetworks: chains.Chain[];
  walletConnectProjectId: string;
  onlyLocalBurnerWallet?: boolean;
};

const scaffoldConfig = {
  targetNetworks: [chains.mainnet],
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
  onlyLocalBurnerWallet: false,
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
