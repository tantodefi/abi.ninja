import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PlausibleProvider from "next-plausible";
import { ThemeProvider } from "next-themes";
import NextNProgress from "nextjs-progressbar";
import { Toaster } from "react-hot-toast";
import { WagmiConfig } from "wagmi";
import { getStoredChainsFromLocalStorage } from "~~/components/NetworksDropdown/utils";
import { useNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { Footer } from "~~/components/Footer";
import "~~/styles/globals.css";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const ScaffoldEthApp = ({ Component, pageProps }: AppProps) => {
  const price = useNativeCurrencyPrice();
  const { addChain, setNativeCurrencyPrice } = useGlobalState(state => ({
    addChain: state.addChain,
    setNativeCurrencyPrice: state.setNativeCurrencyPrice,
  }));

  useEffect(() => {
    const storedCustomChains = getStoredChainsFromLocalStorage();
    storedCustomChains.forEach(chain => {
      addChain(chain);
    });
  }, [addChain]);

  useEffect(() => {
    if (price > 0) {
      setNativeCurrencyPrice(price);
    }
  }, [setNativeCurrencyPrice, price]);

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <main className="relative flex flex-col flex-1">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
};

const ScaffoldEthAppWithProviders = (props: AppProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <PlausibleProvider domain="abi.ninja">
      <ThemeProvider>
        <WagmiConfig config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <NextNProgress />
            <RainbowKitProvider>
              {mounted && <ScaffoldEthApp {...props} />}
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiConfig>
      </ThemeProvider>
    </PlausibleProvider>
  );
};

export default ScaffoldEthAppWithProviders;
