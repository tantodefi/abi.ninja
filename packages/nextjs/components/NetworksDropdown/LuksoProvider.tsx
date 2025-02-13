import { createClientUPProvider } from "@lukso/up-provider";
import { FC, useEffect, useState } from "react";
import { createWalletClient, custom } from "viem";
import { lukso } from "viem/chains";
import { luksoStore, useLuksoProvider } from "~~/hooks/useLuksoProvider";

interface LuksoProviderProps {
  children: React.ReactNode;
}

export const LuksoProvider: FC<LuksoProviderProps> = ({ children }) => {
  const [client, setClient] = useState<any>(null);
  const { setProvider } = useLuksoProvider();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initProvider = async () => {
      try {
        const upProvider = createClientUPProvider();
        
        if (!upProvider) {
          console.error("UP Provider not available");
          return;
        }

        setProvider(upProvider);

        const walletClient = createWalletClient({
          chain: lukso,
          transport: custom(upProvider),
        });

        setClient(walletClient);

        // Try to get initial accounts
        try {
          await walletClient.getAddresses();
        } catch (accountError) {
          console.log("No accounts available yet");
        }
      } catch (err) {
        console.error("Provider initialization:", err);
      }
    };

    initProvider();
  }, [setProvider]);

  useEffect(() => {
    const provider = luksoStore.getState().provider;
    if (!provider || !client) return;

    const handleAccountsChanged = async () => {
      try {
        await client.getAddresses();
      } catch (error) {
        console.log("Error getting accounts:", error);
      }
    };

    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", (id: number) => {
      console.log("Chain changed to:", id);
    });

    return () => {
      provider.removeListener("accountsChanged", handleAccountsChanged);
      provider.removeListener("chainChanged", (id: number) => console.log("Chain changed to:", id));
    };
  }, [client]);

  return <>{children}</>;
}; 