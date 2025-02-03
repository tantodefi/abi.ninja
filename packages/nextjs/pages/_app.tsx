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
  // Only import UPProviderComponent on client side
  const [UPProviderComponent, setUPProviderComponent] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Dynamically import the UPProviderComponent
    import("~~/components/providers/UPProvider").then(module => {
      setUPProviderComponent(() => module.UPProviderComponent);
    });
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const Wrapper = UPProviderComponent || (({ children }: { children: React.ReactNode }) => <>{children}</>);

  return (
    <PlausibleProvider domain="abi.ninja">
      <WagmiConfig config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <NextNProgress />
            <RainbowKitProvider>
              <Wrapper>
                <ScaffoldEthApp {...props} />
              </Wrapper>
            </RainbowKitProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </WagmiConfig>
    </PlausibleProvider>
  );
};

export default ScaffoldEthAppWithProviders;
