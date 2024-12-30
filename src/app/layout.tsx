'use client';

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from '@privy-io/react-auth';
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";

const queryClient = new QueryClient();

// Define Solana chain configuration
const SOLANA_DEVNET_CLUSTER = [{name: 'devnet', rpcUrl: 'https://api.devnet.solana.com'}]


const SOLANA_DEVNET = {
  id: 1,
  name: 'Solana Devnet',
  rpcUrls: {
    default: {
      http: ['https://api.devnet.solana.com'],
    },
    privyWalletOverride: {
      http: ['https://api.devnet.solana.com'],
    }
  },
  nativeCurrency: {
    name: 'SOL',
    symbol: 'SOL',
    decimals: 9,
  },
  testnet: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex flex-col min-h-full">
        <PrivyProvider
          appId="cm51rmjaz04s9ojzwfaopdnzd"
          config={{
            embeddedWallets: {
              createOnLogin: 'off',
              noPromptOnSignature: true,
            },
            solanaClusters: [{name: 'devnet', rpcUrl: 'https://api.devnet.solana.com'}],
            appearance: {
              walletChainType: 'solana-only',
              theme: 'light',
              accentColor: '#3b82f6'
            }
          }}
        >
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <div className="flex flex-col min-h-full">
                <Header className="fixed top-0 left-0 right-0 z-50" />
                <main className="flex-1 overflow-y-auto pt-20 pb-16">
                  {children}
                </main>
                <BottomNav className="fixed bottom-0 left-0 right-0 z-50" />
              </div>
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </QueryClientProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}