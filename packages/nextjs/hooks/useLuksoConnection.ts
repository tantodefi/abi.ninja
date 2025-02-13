import { useCallback, useEffect, useState } from 'react';
import { useLuksoProvider } from './useLuksoProvider';

export const useLuksoConnection = () => {
  const provider = useLuksoProvider(state => state.provider);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (provider) {
        try {
          const accounts = await provider.getAccounts();
          if (accounts[0]) {
            setAddress(accounts[0]);
            setIsConnected(true);
          }
        } catch (error) {
          console.error('Error checking LUKSO connection:', error);
        }
      }
    };

    checkConnection();
  }, [provider]);

  const connect = useCallback(async () => {
    if (provider) {
      try {
        await provider.connect();
        const accounts = await provider.getAccounts();
        if (accounts[0]) {
          setAddress(accounts[0]);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error connecting to LUKSO:', error);
      }
    }
  }, [provider]);

  const disconnect = useCallback(async () => {
    if (provider) {
      try {
        await provider.disconnect();
        setAddress(null);
        setIsConnected(false);
      } catch (error) {
        console.error('Error disconnecting from LUKSO:', error);
      }
    }
  }, [provider]);

  return {
    address,
    isConnected,
    connect,
    disconnect,
    provider,
  };
}; 