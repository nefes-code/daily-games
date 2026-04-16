"use client";

import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import {
  Button,
  Dialog,
  Flex,
  HStack,
  Portal,
  Square,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useLoginModal } from "@/lib/login-modal-context";
import { NefesLogo } from "@/components/NefesLogo";
import { CloseCircle, Ranking } from "@solar-icons/react";
import GoogleIcon from "@/components/GoogleIcon";

export function LoginModal() {
  const { open, closeLogin } = useLoginModal();
  const { data: session, update } = useSession();

  const handleGoogleLogin = () => {
    signIn("google");
  };

  // Quando o usuário volta para esta aba após fazer login na nova aba,
  // atualiza a sessão e fecha o modal automaticamente.
  useEffect(() => {
    async function onFocus() {
      const updated = await update();
      if (updated?.user) closeLogin();
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [update, closeLogin]);

  // Fecha o modal se a sessão já foi obtida (ex: login concluído)
  useEffect(() => {
    if (session?.user && open) closeLogin();
  }, [session, open, closeLogin]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) closeLogin();
      }}
      placement={"center"}
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="bg.panel"
            rounded="2xl"
            mx={4}
            maxW="400px"
            w="full"
            boxShadow="xl"
          >
            <Dialog.CloseTrigger color="fg.subtle" cursor={"pointer"}>
              <CloseCircle size={24} weight="BoldDuotone" />
            </Dialog.CloseTrigger>
            <Dialog.Body px={8} py={10}>
              <VStack gap={6}>
                <HStack>
                  <Square
                    borderRadius={"lg"}
                    bgColor={"brand.solid"}
                    size={"64px"}
                    color={"black"}
                  >
                    <NefesLogo size={50} />
                  </Square>
                  <Square
                    ml={-4}
                    borderRadius={"lg"}
                    bgColor={"brand.fg"}
                    size={"67px"}
                    shadow={"lg"}
                    borderColor={"white"}
                    borderWidth={3}
                    color={"white"}
                  >
                    <Ranking weight="BoldDuotone" size={36} />
                  </Square>
                </HStack>
                <Stack gap={2} textAlign="center">
                  <Text fontSize="2xl" fontWeight="800" color="fg">
                    Conquiste o primeiro lugar
                  </Text>
                  <Text fontSize="md" color="fg.muted" fontWeight="600" mt={1}>
                    Faça login para registrar seus resultados e competir com os
                    membro da NeFEs!
                  </Text>
                </Stack>

                <Button
                  w="full"
                  size="xl"
                  bg="bg.inverted"
                  color="fg.muted"
                  borderWidth={1}
                  borderColor="border.muted"
                  rounded="xl"
                  fontWeight="700"
                  _hover={{ bg: "bg.inverted/80" }}
                  onClick={handleGoogleLogin}
                >
                  <Flex align="center" gap={3}>
                    <GoogleIcon />
                    <Text color={"bg"}>Continuar com Google</Text>
                  </Flex>
                </Button>

                <Text fontSize="xs" color="fg.subtle" textAlign="center">
                  O login é necessário apenas para registrar resultados. Só
                  salvamos seu nome e email para mostrar no ranking e nas
                  estatísticas.
                </Text>
              </VStack>
            </Dialog.Body>

            <Dialog.CloseTrigger
              position="absolute"
              top={3}
              right={3}
              fontSize="lg"
              color="fg.subtle"
              _hover={{ color: "fg.muted" }}
            />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
