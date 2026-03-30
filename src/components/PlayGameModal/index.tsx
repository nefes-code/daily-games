"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  Field,
  Flex,
  HStack,
  Input,
  Link,
  Portal,
  Separator,
  Square,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useSubmitResult } from "@/services/results/hooks";
import { GameIconDisplay } from "@/utils/game-icon";
import { CloseCircle, Ghost, SquareBottomUp } from "@solar-icons/react";
import type { Game, ResultStatus } from "@/services/types";

type RoundState = {
  value: string;
  minutes: string;
  seconds: string;
  won: boolean;
};

function emptyRound(): RoundState {
  return { value: "", minutes: "", seconds: "", won: true };
}

export function PlayGameModal({
  game,
  open,
  onClose,
}: {
  game: Game;
  open: boolean;
  onClose: () => void;
}) {
  const numRounds = game.resultRounds ?? 1;
  const isMultiRound = numRounds > 1;
  const isTime = game.resultType === "TIME";

  const [rounds, setRounds] = useState<RoundState[]>(() =>
    Array.from({ length: numRounds }, emptyRound),
  );
  const { data: session } = useSession();
  const submitResult = useSubmitResult();

  function reset() {
    setRounds(Array.from({ length: numRounds }, emptyRound));
  }

  function handleClose() {
    reset();
    onClose();
  }

  function updateRound(idx: number, patch: Partial<RoundState>) {
    setRounds((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    );
  }

  function getNumericValue(r: RoundState): number {
    if (isTime) {
      return parseInt(r.minutes || "0") * 60 + parseInt(r.seconds || "0");
    }
    return parseInt(r.value);
  }

  function isRoundValid(r: RoundState): boolean {
    if (!r.won) return true; // LOSS — no value needed
    if (isTime) return getNumericValue(r) > 0;
    const num = parseInt(r.value);
    if (isNaN(num) || num < 0) return false;
    if (game.resultMax !== null && num > game.resultMax) return false;
    return true;
  }

  function isValid(): boolean {
    return rounds.every(isRoundValid);
  }

  async function handleSubmit() {
    if (!isValid()) return;

    const today = new Date().toISOString().split("T")[0];

    const roundsPayload = rounds.map((r, i) => {
      const won = r.won;
      const value = won ? getNumericValue(r) : (game.resultMax ?? 0) + 1;
      return {
        round: i + 1,
        value,
        status: (won ? "WIN" : "LOSS") as ResultStatus,
      };
    });

    await submitResult.mutateAsync({
      playedAt: today,
      gameId: game.id,
      ...(game.type === "COMPETITIVE" && session?.user?.id
        ? { userId: session.user.id }
        : {}),
      rounds: roundsPayload,
    });

    handleClose();
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) handleClose();
      }}
      scrollBehavior={"inside"}
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="white"
            rounded="2xl"
            mx={4}
            maxW="420px"
            w="full"
            boxShadow="xl"
          >
            <Dialog.CloseTrigger color="gray.300" cursor={"pointer"}>
              <CloseCircle size={24} weight="BoldDuotone" />
            </Dialog.CloseTrigger>
            <Dialog.Body px={8} py={10}>
              <VStack gap={6}>
                {/* Icon header */}
                <Square
                  borderRadius="lg"
                  bgColor="brand.solid"
                  size="64px"
                  color="white"
                >
                  <GameIconDisplay icon={game.icon} size={32} />
                </Square>

                {/* Title */}
                <Stack gap={1} textAlign="center">
                  <Text fontSize="2xl" fontWeight="800" color="gray.800">
                    {game.name}
                  </Text>
                  <Text mt={1} fontSize="sm" color="gray.500" fontWeight="600">
                    {game.type === "COOPERATIVE"
                      ? "Cooperativo"
                      : "Competitivo"}
                    {" · "}
                    {isTime ? "Tempo" : "Pontuação"}
                    {isMultiRound ? ` · ${numRounds} rodadas` : ""}
                  </Text>
                  <Text fontSize="sm" color="gray.500" fontWeight="600">
                    {game.lowerIsBetter
                      ? "Menor resultado é melhor"
                      : "Maior resultado é melhor"}
                  </Text>
                  <Flex w="full" justifyContent="center">
                    <Link
                      href={game.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      fontSize="sm"
                      color="gray.400"
                      fontWeight="600"
                      display="flex"
                      alignItems="center"
                      gap={1}
                      _hover={{ color: "brand.solid" }}
                    >
                      Ir para o jogo
                      <SquareBottomUp weight="Bold" size={14} />
                    </Link>
                  </Flex>
                </Stack>
                <Separator width={"100%"} borderColor={"gray.100"} />
                {/* Rounds */}
                {rounds.map((round, idx) => (
                  <Box key={idx} w="full">
                    <HStack w={"100%"} justifyContent={"space-between"}>
                      {isMultiRound && (
                        <Text
                          fontSize="sm"
                          fontWeight="800"
                          color="gray.400"
                          textTransform="uppercase"
                          letterSpacing="0.05em"
                          mb={2}
                        >
                          Rodada {idx + 1}
                        </Text>
                      )}

                      {/* WIN/LOSS toggle */}
                      {game.resultMax != null && (
                        <Flex gap={2} mb={2}>
                          <Button
                            size="xs"
                            height={7}
                            variant={round.won ? "solid" : "outline"}
                            bg={round.won ? "brand.solid" : undefined}
                            color={round.won ? "white" : "gray.500"}
                            borderColor={round.won ? "brand.solid" : "gray.200"}
                            rounded="lg"
                            fontWeight="700"
                            _hover={{
                              bg: round.won ? "brand.solid" : "gray.50",
                            }}
                            onClick={() => updateRound(idx, { won: true })}
                          >
                            Acertei
                          </Button>
                          <Button
                            size="xs"
                            variant={!round.won ? "solid" : "outline"}
                            bg={!round.won ? "red.500" : undefined}
                            color={!round.won ? "white" : "gray.500"}
                            borderColor={!round.won ? "red.500" : "gray.200"}
                            rounded="lg"
                            fontWeight="700"
                            height={7}
                            _hover={{
                              bg: !round.won ? "red.600" : "gray.50",
                            }}
                            onClick={() => updateRound(idx, { won: false })}
                          >
                            Não acertei
                          </Button>
                        </Flex>
                      )}
                    </HStack>
                    {/* Input (hidden when LOSS) */}
                    {round.won && (
                      <>
                        {isTime ? (
                          <Flex gap={3} w="full" align="flex-end">
                            <Field.Root flex={1}>
                              <Field.Label fontWeight="700" fontSize="sm">
                                Minutos
                              </Field.Label>
                              <Input
                                type="number"
                                min={0}
                                placeholder="0"
                                value={round.minutes}
                                onChange={(e) =>
                                  updateRound(idx, { minutes: e.target.value })
                                }
                                rounded="xl"
                                borderWidth={2}
                                borderColor="gray.200"
                                textAlign="center"
                                fontSize={isMultiRound ? "xl" : "2xl"}
                                fontWeight="800"
                                py={isMultiRound ? 4 : 6}
                                _focus={{
                                  borderColor: "brand.solid",
                                  boxShadow: "none",
                                }}
                              />
                            </Field.Root>
                            <Text
                              fontSize={isMultiRound ? "xl" : "2xl"}
                              fontWeight="800"
                              color="gray.300"
                              pb={2}
                            >
                              :
                            </Text>
                            <Field.Root flex={1}>
                              <Field.Label fontWeight="700" fontSize="sm">
                                Segundos
                              </Field.Label>
                              <Input
                                type="number"
                                min={0}
                                max={59}
                                placeholder="00"
                                value={round.seconds}
                                onChange={(e) =>
                                  updateRound(idx, { seconds: e.target.value })
                                }
                                rounded="xl"
                                borderWidth={2}
                                borderColor="gray.200"
                                textAlign="center"
                                fontSize={isMultiRound ? "xl" : "2xl"}
                                fontWeight="800"
                                py={isMultiRound ? 4 : 6}
                                _focus={{
                                  borderColor: "brand.solid",
                                  boxShadow: "none",
                                }}
                              />
                            </Field.Root>
                          </Flex>
                        ) : (
                          <Field.Root w="full">
                            <Field.Label fontWeight="700" fontSize="sm">
                              {game.resultSuffix
                                ? `Resultado (${game.resultSuffix})`
                                : "Resultado"}
                            </Field.Label>
                            <Input
                              type="number"
                              min={0}
                              max={game.resultMax ?? undefined}
                              placeholder={
                                game.resultMax ? `0 – ${game.resultMax}` : "0"
                              }
                              value={round.value}
                              onChange={(e) =>
                                updateRound(idx, { value: e.target.value })
                              }
                              rounded="xl"
                              borderWidth={2}
                              borderColor="gray.200"
                              textAlign="center"
                              fontSize={isMultiRound ? "xl" : "3xl"}
                              fontWeight="800"
                              py={isMultiRound ? 4 : 7}
                              _focus={{
                                borderColor: "brand.solid",
                                boxShadow: "none",
                              }}
                            />
                            {game.resultMax && !isMultiRound && (
                              <Text
                                fontSize="xs"
                                color="gray.400"
                                mt={1}
                                textAlign="center"
                              >
                                Máximo: {game.resultMax}
                              </Text>
                            )}
                          </Field.Root>
                        )}
                      </>
                    )}

                    {!round.won && (
                      <Box
                        bg="red.50"
                        rounded="xl"
                        px={4}
                        mt={1}
                        py={2}
                        borderColor="red.500/10"
                      >
                        <Text
                          fontSize="sm"
                          fontWeight="700"
                          color="red.500"
                          textAlign="center"
                        >
                          ✕ Não acertou
                          {game.resultMax
                            ? ` — contará como ${game.resultMax + 1}`
                            : ""}
                        </Text>
                      </Box>
                    )}
                  </Box>
                ))}
              </VStack>
            </Dialog.Body>
            <Dialog.Footer pb={6}>
              <Stack w="full">
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
                  onClick={handleSubmit}
                  disabled={!isValid()}
                  loading={submitResult.isPending}
                >
                  Salvar resultado
                </Button>

                {submitResult.isError && (
                  <Text
                    fontSize="sm"
                    color="red.500"
                    fontWeight="600"
                    textAlign="center"
                  >
                    {(submitResult.error as Error).message ??
                      "Erro ao salvar resultado"}
                  </Text>
                )}
              </Stack>
            </Dialog.Footer>

            <Dialog.CloseTrigger
              position="absolute"
              top={3}
              right={3}
              color="gray.400"
              _hover={{ color: "gray.600" }}
            />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
