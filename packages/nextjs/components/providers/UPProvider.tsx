import { createClientUPProvider } from '@lukso/up-provider';
import { useEffect, useState } from 'react';
import { notification } from "~~/utils/scaffold-eth";

export const useUPProvider = () => {
  const [provider, setProvider] = useState<any>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [contextAccounts, setContextAccounts] = useState<string[]>([]);
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    // Only create the provider on the client side
    const upProvider = createClientUPProvider();
    setProvider(upProvider);

    const init = async () => {
      try {
        // Get initial chain ID
        const chainIdHex = await upProvider.request({ method: 'eth_chainId' });
        const currentChainId = Number(chainIdHex);
        setChainId(currentChainId);

        // Get initial accounts
        const currentAccounts = await upProvider.request({ method: 'eth_accounts' });
        setAccounts(currentAccounts || []);

        // Get initial context accounts
        const currentContextAccounts = await upProvider.request({ method: 'up_contextAccounts' });
        setContextAccounts(currentContextAccounts || []);

        updateConnected(currentAccounts || [], currentContextAccounts || []);
      } catch (error) {
        console.error('Error initializing UP Provider:', error);
      }
    };

    const updateConnected = (currentAccounts: string[], currentContextAccounts: string[]) => {
      setWalletConnected(currentAccounts.length > 0 && currentContextAccounts.length > 0);
    };

    // Setup event listeners
    const accountsChanged = (newAccounts: string[]) => {
      setAccounts(newAccounts);
      if (chainId !== null) {
        updateConnected(newAccounts, contextAccounts);
      }
      notification.info("Account changed");
    };

    const contextAccountsChanged = (newContextAccounts: string[]) => {
      setContextAccounts(newContextAccounts);
      if (chainId !== null) {
        updateConnected(accounts, newContextAccounts);
      }
      notification.info("Context account changed");
    };

    const chainChanged = (newChainId: string) => {
      const numericChainId = Number(newChainId);
      setChainId(numericChainId);
      updateConnected(accounts, contextAccounts);
      notification.info("Network changed");
    };

    if (upProvider) {
      init();

      upProvider.on('accountsChanged', accountsChanged);
      upProvider.on('chainChanged', (chainId: string) => chainChanged(chainId));
      upProvider.on('contextAccountsChanged', contextAccountsChanged);
    }

    return () => {
      if (upProvider) {
        upProvider.removeListener('accountsChanged', accountsChanged);
        upProvider.removeListener('contextAccountsChanged', contextAccountsChanged);
        upProvider.removeListener('chainChanged', chainChanged);
      }
    };
  }, [accounts, contextAccounts, chainId]); // Dependencies are needed for the event handlers

  return {
    provider,
    chainId,
    accounts,
    contextAccounts,
    walletConnected,
  };
}; 