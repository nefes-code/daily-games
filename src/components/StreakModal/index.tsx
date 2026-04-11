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
  Bolt,
  Shield,
} from "@solar-icons/react";
import type { UserStreak, BoostInfo, RescueInfo } from "@/services/types";
import { useAttemptRescue } from "@/services/users/hooks";

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
      bg={highlight ? "brand.solid" : "gray.50"}
      align="center"
    >
      <HStack>
        <Text
          fontSize="3xl"
          fontWeight="800"
          color={highlight ? "black" : "gray.800"}
          lineHeight={1}
        >
          {value}
        </Text>
        <Box color={highlight ? "black" : "gray.400"} mb={1}>
          {icon}
        </Box>
      </HStack>
      <Text
        fontSize="sm"
        fontWeight="600"
        color={highlight ? "blackAlpha.700" : "gray.500"}
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
  boostInfo,
  rescueInfo,
  userId,
}: {
  open: boolean;
  onClose: () => void;
  streak: UserStreak | undefined;
  boostInfo?: BoostInfo;
  rescueInfo?: RescueInfo;
  userId?: string;
}) {
  const current = streak?.currentStreak ?? 0;
  const longest = streak?.longestStreak ?? 0;
  const total = streak?.totalDays ?? 0;
  const playedToday = streak?.playedToday ?? false;
  const attemptRescue = useAttemptRescue();

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
            <Dialog.CloseTrigger color="gray.300" cursor={"pointer"}>
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
                    <Text>Jogue hoje para manter o streak!</Text>
                  )}
                  {!playedToday && current === 0 && (
                    <Text>Registre um resultado hoje para começar!</Text>
                  )}
                  {playedToday && (
                    <Text color="blackAlpha.500">Você já jogou hoje ✓</Text>
                  )}
                </Center>

                {/* Boost info */}
                {boostInfo && current > 0 && (
                  <Box
                    w="100%"
                    p={4}
                    borderRadius="xl"
                    bg="purple.50"
                    borderWidth={1}
                    borderColor="purple.200"
                  >
                    <HStack gap={2} mb={1}>
                      <Bolt
                        size={20}
                        weight="BoldDuotone"
                        color="var(--chakra-colors-purple-500)"
                      />
                      <Text fontSize="sm" fontWeight="700" color="purple.700">
                        Impulso disponível
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="purple.600">
                      Sua streak de {current} dias permite um impulso de{" "}
                      <Text as="span" fontWeight="800">
                        {(
                          (1 - (boostInfo.potentialMultiplier ?? 1)) *
                          100
                        ).toFixed(1)}
                        %
                      </Text>{" "}
                      nos seus resultados. Use na página do jogo!
                    </Text>
                  </Box>
                )}

                {/* Rescue section */}
                {rescueInfo?.canRescue && userId && (
                  <Box
                    w="100%"
                    p={4}
                    borderRadius="xl"
                    bg="red.50"
                    borderWidth={1}
                    borderColor="red.200"
                  >
                    <HStack gap={2} mb={2}>
                      <Shield
                        size={20}
                        weight="BoldDuotone"
                        color="var(--chakra-colors-red-500)"
                      />
                      <Text fontSize="sm" fontWeight="700" color="red.700">
                        Resgate de Streak
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="red.600" mb={3}>
                      Sua streak de{" "}
                      <Text as="span" fontWeight="800">
                        {rescueInfo.previousStreak} dias
                      </Text>{" "}
                      foi perdida! Fique em 1º lugar em qualquer jogo
                      competitivo hoje para resgatá-la.
                    </Text>
                    <Button
                      size="sm"
                      colorPalette="red"
                      w="100%"
                      loading={attemptRescue.isPending}
                      onClick={() => attemptRescue.mutate(userId)}
                    >
                      <Shield size={16} weight="BoldDuotone" />
                      Verificar Resgate
                    </Button>
                    {attemptRescue.isSuccess && (
                      <Text
                        fontSize="xs"
                        color="green.600"
                        fontWeight="600"
                        mt={2}
                        textAlign="center"
                      >
                        Streak resgatada com sucesso! 🎉
                      </Text>
                    )}
                    {attemptRescue.isError && (
                      <Text
                        fontSize="xs"
                        color="red.600"
                        fontWeight="600"
                        mt={2}
                        textAlign="center"
                      >
                        Você ainda não está em 1º em nenhum jogo hoje.
                      </Text>
                    )}
                  </Box>
                )}
              </VStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
