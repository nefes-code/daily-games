"use client";

import {
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
import {
  CloseCircle,
  CupStar,
  CalendarMark,
  ChartSquare,
  DangerTriangle,
  HashtagSquare,
  Fire,
  Cup,
  InfoSquare,
} from "@solar-icons/react";
import type { Game } from "@/services/types";

function RuleCard({
  icon,
  title,
  description,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <Flex
      gap={3}
      p={4}
      borderRadius="xl"
      bg={highlight ? "brand.solid/8" : "gray.50"}
      borderWidth={highlight ? 1 : 0}
      borderColor={highlight ? "brand.solid/20" : "transparent"}
      align="flex-start"
    >
      <Flex
        w={8}
        h={8}
        rounded="lg"
        bg={highlight ? "brand.solid" : "gray.200"}
        color={highlight ? "white" : "gray.500"}
        align="center"
        justify="center"
        flexShrink={0}
      >
        {icon}
      </Flex>
      <Box>
        <Text fontSize="sm" fontWeight="800" color="gray.800" mb={0.5}>
          {title}
        </Text>
        <Text fontSize="sm" color="gray.500" fontWeight="500" lineHeight="1.5">
          {description}
        </Text>
      </Box>
    </Flex>
  );
}

export function LeaderboardInfoModal({
  open,
  onClose,
  game,
}: {
  open: boolean;
  onClose: () => void;
  game: Game;
}) {
  const isLower = game.lowerIsBetter;
  const hasMax = game.resultMax !== null;

  const penaltyDescription = isLower
    ? hasMax
      ? `${game.resultMax}${game.resultSuffix ? ` ${game.resultSuffix}` : ""} (o pior valor possível)`
      : "o pior resultado registrado no período"
    : "zero pontos";

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(d) => !d.open && onClose()}
      scrollBehavior="inside"
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="white"
            rounded="2xl"
            mx={4}
            w="full"
            boxShadow="xl"
          >
            <Dialog.CloseTrigger color="gray.300" cursor="pointer">
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
                    <CupStar size={32} weight="BoldDuotone" />
                  </Square>
                  <Stack gap={1}>
                    <Text fontSize="2xl" fontWeight="800" color="gray.800">
                      Como funciona o ranking?
                    </Text>
                    <Text fontSize="sm" color="gray.500" fontWeight="600">
                      O ranking valoriza quem joga todo dia, não só quem joga
                      bem
                    </Text>
                  </Stack>
                </VStack>

                <Separator width="100%" borderColor="gray.100" />

                {/* Rules */}
                <VStack gap={2} align="stretch" w="full">
                  <RuleCard
                    icon={<CalendarMark size={16} weight="BoldDuotone" />}
                    title="Período: últimos 30 dias"
                    description="Só resultados dos últimos 30 dias entram no cálculo. O ranking é renovado continuamente."
                  />
                  <RuleCard
                    icon={<ChartSquare size={16} weight="BoldDuotone" />}
                    title="Posição definida pela média"
                    description={`Quem aparece em 1º possui a melhor média de resultados no período. ${isLower ? `Aqui no ${game.name}, menor é melhor.` : `Aqui no ${game.name}, maior é melhor.`}`}
                  />
                  <RuleCard
                    icon={<DangerTriangle size={16} weight="BoldDuotone" />}
                    title="Dia não registrado = penalidade"
                    description={`Se você não registrar num dia que outros jogaram, esse dia conta como ${penaltyDescription} na sua média. Registrar qualquer resultado, por pior que seja, sempre ajuda.`}
                    highlight
                  />
                  <RuleCard
                    icon={<HashtagSquare size={16} weight="BoldDuotone" />}
                    title="X/Y dias"
                    description="Indica quantos dias você registrou resultado em relação ao total de dias jogados pelo grupo no período."
                  />
                  <RuleCard
                    icon={<Fire size={16} weight="BoldDuotone" />}
                    title="Streak"
                    description="Quantos dias consecutivos você registrou resultado neste jogo. Manter a sequência é um sinal de dedicação."
                  />
                  <RuleCard
                    icon={<Cup size={16} weight="BoldDuotone" />}
                    title="Melhor resultado"
                    description="Seu melhor resultado real — apenas nos dias em que você jogou, sem penalidades."
                  />
                </VStack>

                <HStack
                  gap={2}
                  p={4}
                  borderRadius="xl"
                  bg="red.500/20"
                  w="full"
                  justify={"center"}
                >
                  <Text
                    fontSize="xs"
                    color="red.500"
                    fontWeight="600"
                    lineHeight="1.6"
                  >
                    Registrar um resultado ruim sempre vale mais do que não
                    registrar nada.
                  </Text>
                </HStack>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer px={8} pt={4} pb={8}>
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
                _active={{ boxShadow: "none", transform: "translateY(4px)" }}
                transition="all 0.1s"
                onClick={onClose}
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
