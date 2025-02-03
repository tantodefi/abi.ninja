import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import * as viemChains from "viem/chains";
import scaffoldConfig from "../../scaffold.config";
import { getTargetNetworks } from "../../utils/scaffold-eth";

const projectId = scaffoldConfig.walletConnectProjectId || "YOUR_PROJECT_ID";
const appName = "Scaffold-ETH 2";
const targetChains = getTargetNetworks();

const needsInjectedWalletFallback =
  typeof window !== "undefined" && window.ethereum && !window.ethereum.isMetaMask && !window.ethereum.isCoinbaseWallet;

const connectorConfig = {
  appName,
  projectId,
  chains: targetChains,
  options: {
    shimDisconnect: true,
  },
};

/**
 * wagmi connectors for the wagmi context
 */
export const connectors = [
  metaMaskWallet(connectorConfig),
  walletConnectWallet(connectorConfig),
  coinbaseWallet(connectorConfig),
  ...(needsInjectedWalletFallback ? [injectedWallet(connectorConfig)] : []),
];
