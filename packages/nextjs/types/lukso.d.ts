import { UP } from '@lukso/up-provider';

declare global {
  interface Window {
    ethereum?: {
      isLukso?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
    lukso?: UP;
  }
} 