"use client";

import {
  Box,
  Button,
  Center,
  Dialog,
  Grid,
  HStack,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  Fire,
  StarCircle,
  CalendarMinimalistic,
  CloseCircle,
} from "@solar-icons/react";
import type { UserStreak } from "@/services/types";

function StatBox({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <VStack
      gap={1}
      p={4}
      borderRadius="xl"
      bg={highlight ? "brand.solid" : "bg.subtle"}
      align="center"
    >
      <HStack>
        <Text
          fontSize="3xl"
          fontWeight="800"
          color={highlight ? "black" : "fg"}
          lineHeight={1}
        >
          {value}
        </Text>
        <Box color={highlight ? "black" : "fg.subtle"} mb={1}>
          {icon}
        </Box>
      </HStack>
      <Text
        fontSize="sm"
        fontWeight="600"
        color={highlight ? "blackAlpha.700" : "fg.muted"}
        textAlign="center"
      >
        {label}
      </Text>
    </VStack>
  );
}

export function StreakModal({
  open,
  onClose,
  streak,
}: {
  open: boolean;
  onClose: () => void;
  streak: UserStreak | undefined;
}) {
  const current = streak?.currentStreak ?? 0;
  const longest = streak?.longestStreak ?? 0;
  const total = streak?.totalDays ?? 0;
  const playedToday = streak?.playedToday ?? false;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(d) => !d.open && onClose()}
      size="sm"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content borderRadius="2xl">
            <Dialog.CloseTrigger color="fg.subtle" cursor={"pointer"}>
              <CloseCircle size={24} weight="BoldDuotone" />
            </Dialog.CloseTrigger>
            <Dialog.Header pb={0}>
              <HStack justify="space-between" w="100%">
                <HStack gap={1}>
                  <Fire
                    size={24}
                    weight="BoldDuotone"
                    color="var(--chakra-colors-orange-400)"
                  />
                  <Dialog.Title fontSize="lg" fontWeight="800">
                    Dias jogados
                  </Dialog.Title>
                </HStack>
              </HStack>
            </Dialog.Header>

            <Dialog.Body pt={4} pb={6}>
              <VStack gap={4}>
                {/* Streak atual em destaque */}
                <Box
                  w="100%"
                  p={5}
                  borderRadius="2xl"
                  bg="brand.solid/10"
                  textAlign="center"
                >
                  <HStack color={"brand.solid"} justify="center">
                    <Text fontSize="6xl" fontWeight="900" lineHeight={1}>
                      {current}
                    </Text>
                    <Fire size={50} weight="BoldDuotone" />
                  </HStack>

                  <HStack justify="center" gap={1} mt={1}>
                    <Text
                      fontSize="xl"
                      fontWeight={"bold"}
                      color={"brand.solid"}
                    >
                      {current === 1 ? "dia consecutivo" : "dias consecutivos"}
                    </Text>
                  </HStack>
                </Box>

                {/* Maior streak e total */}
                <Grid templateColumns="1fr 1fr" gap={3} w="100%">
                  <StatBox
                    icon={<StarCircle size={28} weight="BoldDuotone" />}
                    label="Maior streak"
                    value={longest}
                  />
                  <StatBox
                    icon={
                      <CalendarMinimalistic size={28} weight="BoldDuotone" />
                    }
                    label="Total de dias"
                    value={total}
                  />
                </Grid>
                <Center
                  w="full"
                  borderRadius={"2xl"}
                  fontWeight={"bold"}
                  fontSize={"md"}
                  py={4}
                  bgGradient={"to-l"}
                  gradientTo={playedToday ? "transparent" : "brand.solid"}
                  color={"white"}
                  gradientFrom={playedToday ? "transaparent" : "red.500"}
                >
                  {!playedToday && current > 0 && (
                    <Text color={"fg.muted"}>
                      Jogue hoje para manter o streak!
                    </Text>
                  )}
                  {!playedToday && current === 0 && (
                    <Text color={"fg.muted"}>
                      Registre um resultado hoje para começar!
                    </Text>
                  )}
                  {playedToday && (
                    <Text color={"fg.muted"}>Você já jogou hoje ✓</Text>
                  )}
                </Center>
              </VStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
