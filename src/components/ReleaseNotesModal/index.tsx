"use client";

import {
  Badge,
  Box,
  Button,
  Dialog,
  Flex,
  HStack,
  Portal,
  Separator,
  Square,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { CloseCircle, Rocket } from "@solar-icons/react";
import { releaseNotes, latestRelease } from "@/data/release-notes";

const STORAGE_KEY = "lastSeenVersion";

export function getHasNewRelease(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== latestRelease.version;
}

export function markReleaseAsSeen() {
  localStorage.setItem(STORAGE_KEY, latestRelease.version);
}

export function ReleaseNotesModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  function handleClose() {
    markReleaseAsSeen();
    onClose();
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) handleClose();
      }}
      scrollBehavior="inside"
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="bg.panel"
            rounded="2xl"
            mx={4}
            w="full"
            boxShadow="xl"
          >
            <Dialog.CloseTrigger color="fg.subtle" cursor="pointer">
              <CloseCircle size={24} weight="BoldDuotone" />
            </Dialog.CloseTrigger>

            <Dialog.Body px={8} pt={10} pb={4}>
              <VStack gap={6}>
                {/* Header */}
                <VStack gap={3} textAlign="center">
                  <Square
                    borderRadius="lg"
                    bgColor="brand.solid"
                    size="64px"
                    color="white"
                  >
                    <Rocket size={32} weight="BoldDuotone" />
                  </Square>
                  <Stack gap={1}>
                    <Text fontSize="2xl" fontWeight="800" color="fg">
                      Novidades
                    </Text>
                    <Text fontSize="sm" color="fg.muted" fontWeight="600">
                      Veja o que há de novo no hub de jogos diários
                    </Text>
                  </Stack>
                </VStack>

                <Separator width="100%" borderColor="border.muted" />

                {/* Release list */}
                <VStack gap={5} w="full" align="stretch">
                  {releaseNotes.map((release, i) => (
                    <Box key={release.version}>
                      {/* Version header */}
                      <HStack mb={3} gap={2} align="center">
                        <Badge
                          px={2}
                          py={0.5}
                          rounded="md"
                          fontSize="xs"
                          fontWeight="800"
                          fontFamily="mono"
                          bg={i === 0 ? "brand.solid" : "bg.muted"}
                          color={i === 0 ? "white" : "fg.muted"}
                          letterSpacing="0.03em"
                        >
                          v{release.version}
                        </Badge>
                        <Text
                          fontSize="sm"
                          fontWeight="800"
                          color={i === 0 ? "fg" : "fg.muted"}
                        >
                          {release.title}
                        </Text>
                        <Text
                          fontSize="xs"
                          color="fg.subtle"
                          fontWeight="600"
                          ml="auto"
                        >
                          {release.date}
                        </Text>
                      </HStack>

                      {/* Features */}
                      <VStack gap={2} align="stretch" pl={1}>
                        {release.features.map((f, j) => (
                          <Flex key={j} gap={2} align="flex-start">
                            <Text fontSize="sm" lineHeight="1.6">
                              •
                            </Text>
                            <Text
                              fontSize="sm"
                              color="fg.muted"
                              fontWeight="500"
                              lineHeight="1.6"
                            >
                              {f.text}
                            </Text>
                          </Flex>
                        ))}
                      </VStack>

                      {i < releaseNotes.length - 1 && (
                        <Separator mt={5} borderColor="border.muted" />
                      )}
                    </Box>
                  ))}
                </VStack>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer pb={6} px={8}>
              <Button
                w="full"
                size="lg"
                bg="brand.solid"
                color="white"
                rounded="xl"
                fontWeight="800"
                fontSize="md"
                py={6}
                _hover={{ bg: "brand.emphasized" }}
                boxShadow="0 4px 0 0 var(--chakra-colors-brand-emphasized)"
                _active={{
                  boxShadow: "none",
                  transform: "translateY(4px)",
                }}
                transition="all 0.1s"
                onClick={handleClose}
              >
                Entendido!
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
