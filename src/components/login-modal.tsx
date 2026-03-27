"use client";

import { useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Box,
  Button,
  Dialog,
  Flex,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useLoginModal } from "@/lib/login-modal-context";

function openPopup(url: string) {
  const w = 500;
  const h = 600;
  const left = window.screenX + (window.outerWidth - w) / 2;
  const top = window.screenY + (window.outerHeight - h) / 2;
  return window.open(
    url,
    "google-login",
    `width=${w},height=${h},left=${left},top=${top},popup=yes`,
  );
}

export function LoginModal() {
  const { open, closeLogin } = useLoginModal();
  const { update } = useSession();

  const handleGoogleLogin = useCallback(() => {
    openPopup("/auth/signin");
  }, []);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (e.data === "auth-complete") {
        update();
        closeLogin();
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [update, closeLogin]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) closeLogin();
      }}
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="white"
            rounded="2xl"
            mx={4}
            maxW="400px"
            w="full"
            boxShadow="xl"
          >
            <Dialog.Body px={8} py={10}>
              <VStack gap={6}>
                <Text fontSize="5xl">🎮</Text>
                <Box textAlign="center">
                  <Text fontSize="xl" fontWeight="800" color="gray.800">
                    Entre no Daily Games
                  </Text>
                  <Text fontSize="sm" color="gray.500" fontWeight="600" mt={1}>
                    Faça login para registrar seus resultados e competir com
                    seus amigos!
                  </Text>
                </Box>

                <Button
                  w="full"
                  size="lg"
                  bg="white"
                  color="gray.700"
                  borderWidth={2}
                  borderColor="gray.200"
                  rounded="xl"
                  fontWeight="700"
                  _hover={{ bg: "gray.50", borderColor: "gray.300" }}
                  onClick={handleGoogleLogin}
                >
                  <Flex align="center" gap={3}>
                    <GoogleIcon />
                    <Text>Continuar com Google</Text>
                  </Flex>
                </Button>

                <Text fontSize="xs" color="gray.400" textAlign="center">
                  Todas as páginas são acessíveis sem login.
                  <br />O login é necessário apenas para registrar resultados.
                </Text>
              </VStack>
            </Dialog.Body>

            <Dialog.CloseTrigger
              position="absolute"
              top={3}
              right={3}
              fontSize="lg"
              color="gray.400"
              _hover={{ color: "gray.600" }}
            />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
