"use client";

import { Box, Flex, HStack, IconButton, Square, Text } from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { NefesLogo } from "@/components/NefesLogo";
import { HamburgerMenu } from "@solar-icons/react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Rotas de auth (popup signin/close) renderizam sem shell
  if (pathname.startsWith("/auth")) {
    return <>{children}</>;
  }

  return (
    <Flex minH="100vh">
      {/* Mobile top bar */}
      <Box
        display={{ base: "flex", md: "none" }}
        position="fixed"
        top={0}
        left={0}
        right={0}
        h="56px"
        bg="bg.panel"
        borderBottomWidth={1}
        borderColor="border.muted"
        zIndex={90}
        alignItems="center"
        px={4}
        gap={3}
      >
        <IconButton
          aria-label="Menu"
          variant="ghost"
          size="sm"
          onClick={() => setMobileOpen(true)}
        >
          <HamburgerMenu size={20} />
        </IconButton>
        <HStack gap={2}>
          <Square
            borderRadius="lg"
            bgColor="brand.solid"
            size={7}
            color="black"
          >
            <NefesLogo />
          </Square>
          <Text fontSize="md" fontWeight="bold">
            Jogos diários
          </Text>
        </HStack>
      </Box>

      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Box
        ml={{ base: 0, md: "260px" }}
        flex={1}
        p={{ base: 4, md: 8 }}
        pt={{ base: "72px", md: 8 }}
      >
        {children}
      </Box>
    </Flex>
  );
}
