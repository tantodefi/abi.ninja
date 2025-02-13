import { wagmiConnectors } from "./wagmiConnectors";
import { Chain, createClient, fallback, http } from "viem";
import { hardhat, mainnet } from "viem/chains";
import { createConfig } from "wagmi";
import scaffoldConfig from "~~/scaffold.config";
import { getAlchemyHttpUrl, getTargetNetworks } from "~~/utils/scaffold-eth";

const targetNetworks = getTargetNetworks();

export const luksoMainnet = {
  id: 4201,
  name: "LUKSO Mainnet",
  network: "lukso",
  nativeCurrency: {
    decimals: 18,
    name: "LYX",
    symbol: "LYX",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.lukso.gateway.fm"],
    },
    public: {
      http: ["https://rpc.lukso.gateway.fm"],
    },
  },
  blockExplorers: {
    default: {
      name: "LUKSO Mainnet Explorer",
      url: "https://explorer.lukso.network",
    },
  },
} as const satisfies Chain;

// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
export const enabledChains = targetNetworks.find((network: Chain) => network.id === 1)
  ? [...targetNetworks, luksoMainnet]
  : ([...targetNetworks, mainnet, luksoMainnet] as const);

export const createWagmiClient = ({ chain }: { chain: Chain }) => {
  const alchemyHttpUrl = getAlchemyHttpUrl(chain.id);
  const rpcFallbacks = alchemyHttpUrl ? [http(alchemyHttpUrl), http()] : [http()];

  return createClient({
    chain: {
      ...chain,
      id: chain.id,
      name: chain.name,
      nativeCurrency: chain.nativeCurrency,
      rpcUrls: chain.rpcUrls,
    },
    transport: fallback(rpcFallbacks),
    ...(chain.id !== (hardhat as Chain).id
      ? {
          pollingInterval: scaffoldConfig.pollingInterval,
        }
      : {}),
  });
};

export const baseWagmiConfig = createConfig({
  chains: enabledChains as [Chain, ...Chain[]],
  connectors: wagmiConnectors,
  ssr: true,
  client: createWagmiClient,
});
