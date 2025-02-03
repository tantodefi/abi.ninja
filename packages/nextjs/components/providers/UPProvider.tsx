import { createClientUPProvider, UPProvider } from '@lukso/up-provider';
import { useEffect, useState } from 'react';
import { useGlobalState } from '~~/services/store/store';
import { notification } from '~~/utils/notification';

export const useUPProvider = () => {
  const [provider, setProvider] = useState<UPProvider | null>(null);
  const { targetNetwork } = useGlobalState(state => ({
    targetNetwork: state.targetNetwork,
  }));

  useEffect(() => {
    const initProvider = async () => {
      try {
        const upProvider = createClientUPProvider({
          chainId: targetNetwork.id,
          rpcUrl: targetNetwork.rpcUrls.default.http[0],
        });

        if (upProvider) {
          setProvider(upProvider);
        }
      } catch (error) {
        console.error('Error initializing UP Provider:', error);
        notification.error('Failed to initialize Universal Profile provider');
      }
    };

    initProvider();

    return () => {
      // Cleanup if needed
      if (provider) {
        provider.removeListener('accountsChanged', () => {});
        provider.removeListener('chainChanged', () => {});
      }
    };
  }, [targetNetwork]);

  return provider;
};

export const UPProviderComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const provider = useUPProvider();

  if (!provider) {
    return null;
  }

  return <>{children}</>;
}; 