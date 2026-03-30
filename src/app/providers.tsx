"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { LoginModalProvider } from "@/lib/login-modal-context";
import { LoginModal } from "@/components/LoginModal";
import { useState } from "react";
import "@/styles/global.css";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider value={system}>
          <LoginModalProvider>
            {children}
            <LoginModal />
          </LoginModalProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </ChakraProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
