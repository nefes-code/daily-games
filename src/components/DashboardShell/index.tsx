"use client";

import { Box, Flex } from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Rotas de auth (popup signin/close) renderizam sem shell
  if (pathname.startsWith("/auth")) {
    return <>{children}</>;
  }

  return (
    <Flex minH="100vh">
      <Sidebar />
      <Box ml="260px" flex={1} p={8}>
        {children}
      </Box>
    </Flex>
  );
}
