import { isZeroAddress } from "./scaffold-eth/common";
import type { Chain } from "viem";

interface Method {
  type?: string;
  stateMutability?: string;
  [key: string]: any;
}

export const fetchContractABI = async (contractAddress: string, chainId: number) => {
  try {
    // First try LUKSO if we're on LUKSO chain
    if (chainId === 42) {
      try {
        // Try LUKSO's API first
        const response = await fetch(
          `https://explorer.execution.mainnet.lukso.network/api?module=contract&action=getabi&address=${contractAddress}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.result && data.result !== 'Contract source code not verified') {
            return {
              abi: JSON.parse(data.result),
              implementation: null,
            };
          }
        }
      } catch (luksoError) {
        console.warn("Failed to fetch from LUKSO API:", luksoError);
      }

      // If LUKSO API fails, try direct bytecode check
      try {
        const bytecodeResponse = await fetch(
          `https://mainnet.lukso.network/v1`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_getCode',
              params: [contractAddress, 'latest'],
              id: 1,
            }),
          }
        );

        if (bytecodeResponse.ok) {
          const bytecodeData = await bytecodeResponse.json();
          if (bytecodeData.result && bytecodeData.result !== '0x') {
            // Contract exists, return minimal ABI for interaction
            return {
              abi: [],
              implementation: null,
              isContract: true,
            };
          }
        }
      } catch (bytecodeError) {
        console.warn("Failed to check contract bytecode:", bytecodeError);
      }
    }
    
    // Fallback to Etherscan for other chains
    const etherscanApiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
    const response = await fetch(
      `https://api.etherscan.io/v2/api?chainid=${chainId}&module=contract&action=getsourcecode&address=${contractAddress}&apikey=${etherscanApiKey}`
    );

    if (!response.ok) {
      throw new Error(`Etherscan API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== "1" || !data.result || data.result.length === 0) {
      console.error("Error fetching source code from Etherscan:", data);
      throw new Error("Failed to fetch source code from Etherscan");
    }

    const contractData = data.result[0];
    const implementation = contractData.Implementation || null;

    // If there's an implementation address, make a second call to get its ABI
    if (implementation && !isZeroAddress(implementation)) {
      const abiUrl = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=contract&action=getabi&address=${implementation}&apikey=${etherscanApiKey}`;
      const abiResponse = await fetch(abiUrl);
      const abiData = await abiResponse.json();

      if (abiData.status === "1" && abiData.result) {
        return {
          abi: JSON.parse(abiData.result),
          implementation,
        };
      } else {
        console.error("Error fetching ABI for implementation from Etherscan:", abiData);
        throw new Error("Failed to fetch ABI for implementation from Etherscan");
      }
    }

    // If no implementation or failed to get implementation ABI, return original contract ABI
    return {
      abi: JSON.parse(contractData.ABI),
      implementation,
    };
  } catch (error) {
    console.error("Error fetching ABI:", error);
    throw error;
  }
};

export function parseAndCorrectJSON(input: string): any {
  // Add double quotes around keys
  let correctedJSON = input.replace(/(\w+)(?=\s*:)/g, '"$1"');

  // Remove trailing commas
  correctedJSON = correctedJSON.replace(/,(?=\s*[}\]])/g, "");

  try {
    return JSON.parse(correctedJSON);
  } catch (error) {
    console.error("Failed to parse JSON", error);
    throw new Error("Failed to parse JSON");
  }
}

export const getNetworkName = (chains: Chain[], chainId: number) => {
  const chain = chains.find(chain => chain.id === chainId);
  return chain ? chain.name : "Unknown Network";
};
