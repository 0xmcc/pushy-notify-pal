'use client';

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from '@privy-io/react-auth';
import { BottomNav } from "@/components/BottomNav";

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PrivyProvider
          appId="cm51rmjaz04s9ojzwfaopdnzd"
          config={{
            embeddedWallets: {
              createOnLogin: 'users-without-wallets'
            },
            appearance: {
              theme: 'light',
              accentColor: '#3b82f6'
            }
          }}
        >
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <main className="pb-16">
                {children}
              </main>
              <BottomNav />
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </QueryClientProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}