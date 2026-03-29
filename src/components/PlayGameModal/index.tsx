"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  Field,
  Flex,
  Input,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useSubmitResult } from "@/services/results/hooks";
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
      const totalSecs = getNumericValue();
      return totalSecs > 0;
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
      // Competitivo: envia userId do próprio user
      // Cooperativo: sem userId (resultado do time)
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
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="white"
            rounded="2xl"
            mx={4}
            maxW="440px"
            w="full"
            boxShadow="xl"
          >
            {step === "summary" ? (
              /* ─── Step 1: Resumo do jogo ─── */
              <Dialog.Body px={8} py={8}>
                <VStack gap={5}>
                  <Text fontSize="5xl">
                    {game.type === "COOPERATIVE" ? "🤝" : "⚔️"}
                  </Text>

                  <Box textAlign="center">
                    <Text fontSize="xl" fontWeight="800" color="gray.800">
                      {game.name}
                    </Text>
                    <Flex justify="center" gap={2} mt={2} flexWrap="wrap">
                      <Box
                        bg={
                          game.type === "COOPERATIVE" ? "purple.100" : "red.100"
                        }
                        color={
                          game.type === "COOPERATIVE" ? "purple.700" : "red.700"
                        }
                        px={3}
                        py={0.5}
                        rounded="full"
                        fontSize="xs"
                        fontWeight="800"
                      >
                        {game.type === "COOPERATIVE"
                          ? "Cooperativo"
                          : "Competitivo"}
                      </Box>
                      <Box
                        bg="blue.100"
                        color="blue.700"
                        px={3}
                        py={0.5}
                        rounded="full"
                        fontSize="xs"
                        fontWeight="800"
                      >
                        {isTime ? "⏱ Tempo" : "🎯 Pontuação"}
                      </Box>
                    </Flex>
                  </Box>

                  {game.lowerIsBetter && (
                    <Box
                      bg="orange.50"
                      rounded="xl"
                      px={4}
                      py={2}
                      borderWidth={1}
                      borderColor="orange.200"
                    >
                      <Text
                        fontSize="sm"
                        fontWeight="700"
                        color="orange.600"
                        textAlign="center"
                      >
                        ⬇ Menor é melhor nesse jogo!
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
                    🎮 Ir para o jogo
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
              <Dialog.Body px={8} py={8}>
                <VStack gap={5}>
                  <Text fontSize="4xl">✍️</Text>

                  <Box textAlign="center">
                    <Text fontSize="lg" fontWeight="800" color="gray.800">
                      Registrar resultado
                    </Text>
                    <Text fontSize="sm" color="gray.500" fontWeight="600">
                      {game.name} — Hoje
                    </Text>
                  </Box>

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
                        color="gray.400"
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
                          game.resultMax ? `0 - ${game.resultMax}` : "0"
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
                    Salvar Resultado 🎯
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
