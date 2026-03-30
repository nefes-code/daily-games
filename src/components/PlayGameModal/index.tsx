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
  Portal,
  Square,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useSubmitResult } from "@/services/results/hooks";
import { GameIconDisplay } from "@/utils/game-icon";
import { Ranking, SquareBottomUp } from "@solar-icons/react";
import type { Game } from "@/services/types";

type Step = "summary" | "result";

export function PlayGameModal({
  game,
  open,
  onClose,
}: {
  game: Game;
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>("summary");
  const [value, setValue] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const { data: session } = useSession();
  const submitResult = useSubmitResult();

  const isTime = game.resultType === "TIME";

  function reset() {
    setStep("summary");
    setValue("");
    setMinutes("");
    setSeconds("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleGoToGame() {
    window.open(game.url, "_blank", "noopener,noreferrer");
    setStep("result");
  }

  function getNumericValue(): number {
    if (isTime) {
      return parseInt(minutes || "0") * 60 + parseInt(seconds || "0");
    }
    return parseInt(value);
  }

  function isValid(): boolean {
    if (isTime) {
      return getNumericValue() > 0;
    }
    const num = parseInt(value);
    if (isNaN(num) || num < 0) return false;
    if (game.resultMax !== null && num > game.resultMax) return false;
    return true;
  }

  async function handleSubmit() {
    if (!isValid()) return;

    const today = new Date().toISOString().split("T")[0];

    await submitResult.mutateAsync({
      value: getNumericValue(),
      playedAt: today,
      gameId: game.id,
      ...(game.type === "COMPETITIVE" && session?.user?.id
        ? { userId: session.user.id }
        : {}),
    });

    handleClose();
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) handleClose();
      }}
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
            {step === "summary" ? (
              /* ─── Step 1: Resumo do jogo ─── */
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
                    <Text fontSize="sm" color="gray.500" fontWeight="600">
                      {game.type === "COOPERATIVE"
                        ? "Cooperativo"
                        : "Competitivo"}
                      {" · "}
                      {isTime ? "Tempo" : "Pontuação"}
                    </Text>
                  </Stack>

                  {/* lowerIsBetter notice */}
                  {game.lowerIsBetter && (
                    <Box
                      bg="brand.subtle"
                      rounded="xl"
                      px={4}
                      py={2}
                      borderWidth={1}
                      borderColor="brand.muted"
                      w="full"
                    >
                      <Text
                        fontSize="sm"
                        fontWeight="700"
                        color="brand.fg"
                        textAlign="center"
                      >
                        Menor resultado é melhor nesse jogo
                      </Text>
                    </Box>
                  )}

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
                    onClick={handleGoToGame}
                  >
                    Ir para o jogo
                    <SquareBottomUp weight="BoldDuotone" />
                  </Button>

                  <Text fontSize="xs" color="gray.400" textAlign="center">
                    O jogo abrirá em uma nova aba.
                    <br />
                    Volte aqui para registrar seu resultado!
                  </Text>
                </VStack>
              </Dialog.Body>
            ) : (
              /* ─── Step 2: Registrar resultado ─── */
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
                      Qual foi o seu resultado?
                    </Text>
                    <Text fontSize="sm" color="gray.500" fontWeight="600">
                      {game.name} — hoje
                    </Text>
                  </Stack>

                  {/* Inputs */}
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
                          value={minutes}
                          onChange={(e) => setMinutes(e.target.value)}
                          rounded="xl"
                          borderWidth={2}
                          borderColor="gray.200"
                          textAlign="center"
                          fontSize="2xl"
                          fontWeight="800"
                          py={6}
                          _focus={{
                            borderColor: "brand.solid",
                            boxShadow: "none",
                          }}
                        />
                      </Field.Root>
                      <Text
                        fontSize="2xl"
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
                          value={seconds}
                          onChange={(e) => setSeconds(e.target.value)}
                          rounded="xl"
                          borderWidth={2}
                          borderColor="gray.200"
                          textAlign="center"
                          fontSize="2xl"
                          fontWeight="800"
                          py={6}
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
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        rounded="xl"
                        borderWidth={2}
                        borderColor="gray.200"
                        textAlign="center"
                        fontSize="3xl"
                        fontWeight="800"
                        py={7}
                        _focus={{
                          borderColor: "brand.solid",
                          boxShadow: "none",
                        }}
                      />
                      {game.resultMax && (
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
                </VStack>
              </Dialog.Body>
            )}

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
