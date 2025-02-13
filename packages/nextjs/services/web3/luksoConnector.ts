import { UP } from '@lukso/up-provider';
import { createConnector } from '@wagmi/core';
import type { Chain } from 'viem';

export function luksoConnector({ chains }: { chains?: Chain[] } = {}) {
  let provider: UP | undefined;

  return createConnector((config) => ({
    id: 'lukso',
    name: 'LUKSO',
    type: 'lukso',
    chains,
    options: config.options,

    async connect() {
      const currentProvider = await this.getProvider();
      if (!currentProvider) throw new Error('Provider not found');

      await currentProvider.connect();

      const accounts = await currentProvider.getAccounts();
      const account = accounts[0];
      
      const chainId = await this.getChainId();

      return {
        account,
        chain: {
          id: chainId,
          unsupported: this.isChainUnsupported(chainId),
        },
      };
    },

    async disconnect() {
      const currentProvider = await this.getProvider();
      if (!currentProvider) return;
      
      await currentProvider.disconnect();
      provider = undefined;
    },

    async getAccount() {
      const currentProvider = await this.getProvider();
      if (!currentProvider) throw new Error('Provider not found');

      const accounts = await currentProvider.getAccounts();
      return accounts[0];
    },

    async getChainId() {
      const currentProvider = await this.getProvider();
      if (!currentProvider) throw new Error('Provider not found');

      return currentProvider.getChainId();
    },

    async getProvider() {
      return provider;
    },

    async setProvider(newProvider: UP) {
      provider = newProvider;
    },

    async isAuthorized() {
      try {
        const currentProvider = await this.getProvider();
        if (!currentProvider) return false;

        const accounts = await currentProvider.getAccounts();
        return !!accounts[0];
      } catch {
        return false;
      }
    },

    onAccountsChanged(accounts: string[]) {
      if (accounts.length === 0) config.emitter.emit('disconnect');
      else config.emitter.emit('change', { account: accounts[0] });
    },

    onChainChanged(chainId: number) {
      const unsupported = this.isChainUnsupported(chainId);
      config.emitter.emit('change', { chain: { id: chainId, unsupported } });
    },

    onDisconnect() {
      config.emitter.emit('disconnect');
    },
  }));
} 