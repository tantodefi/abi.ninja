import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia } from "viem/chains";
import { createPublicClient, http } from "viem";
import { createConfig } from "wagmi";
import scaffoldConfig from "~~/scaffold.config";

const projectId = scaffoldConfig.walletConnectProjectId;

// Define LUKSO chain
export const lukso = {
  id: 42,
  name: 'LUKSO',
  network: 'lukso',
  nativeCurrency: {
    decimals: 18,
    name: 'LYX',
    symbol: 'LYX',
  },
  rpcUrls: {
    public: { http: ['https://rpc.mainnet.lukso.network'] },
    default: { http: ['https://rpc.mainnet.lukso.network'] },
  },
  blockExplorers: {
    default: { name: 'LUKSO Explorer', url: 'https://explorer.execution.mainnet.lukso.network' },
  },
} as const;

const chains = [lukso, mainnet, sepolia] as const;

// Create public clients for each chain
const publicClients = {
  [lukso.id]: createPublicClient({
    chain: lukso,
    transport: http('https://rpc.mainnet.lukso.network'),
    batch: {
      multicall: {
        wait: 250,
      },
    },
  }),
  [mainnet.id]: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
  [sepolia.id]: createPublicClient({
    chain: sepolia,
    transport: http(),
  }),
};

// Make sure LUKSO is the first chain in the arrays
const { connectors } = getDefaultWallets({
  appName: "ABI Ninja",
  projectId,
  chains,
});

// Create wagmi config
export const wagmiConfig = createConfig({
  connectors,
  chains,
  transports: {
    [lukso.id]: http('https://rpc.mainnet.lukso.network'),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  publicClient: ({ chainId }) => publicClients[chainId as keyof typeof publicClients],
  ssr: true,
});

// Export network mapping for reference
export const networkMapping: { [key: string]: typeof lukso | typeof mainnet | typeof sepolia } = {
  "1": mainnet,
  "42": lukso,
  "11155111": sepolia,
};

// Set default chain
export const defaultChain = lukso; 