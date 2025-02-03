declare module '@lukso/up-provider' {
  export interface UPProviderConfig {
    chainId?: number;
    rpcUrl?: string;
    ipfsGateway?: string;
  }

  export interface UPProvider {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, callback: (result: any) => void) => void;
    removeListener: (event: string, callback: (result: any) => void) => void;
    isUniversalProfile?: boolean;
    chainId?: number;
  }

  export function createClientUPProvider(config?: UPProviderConfig): UPProvider;
  // Add other type declarations as needed
} 