"use client";

import { useRef, useState } from "react";
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
import { useSubmitResult, useApplyBoost } from "@/services/results/hooks";
import { GameIconDisplay } from "@/utils/game-icon";
import { getToday } from "@/utils/date";
import { Bolt, CloseCircle, SquareBottomUp } from "@solar-icons/react";
import type { Game, ResultStatus, BoostInfo } from "@/services/types";
import { Tooltip } from "@/components/Tooltip";

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
  boostInfo,
}: {
  game: Game;
  open: boolean;
  onClose: () => void;
  boostInfo?: BoostInfo;
}) {
  const numRounds = game.resultRounds ?? 1;
  const isMultiRound = numRounds > 1;
  const isTime = game.resultType === "TIME";

  const [rounds, setRounds] = useState<RoundState[]>(() =>
    Array.from({ length: numRounds }, emptyRound),
  );
  const [boostedRoundIdx, setBoostedRoundIdx] = useState<number | null>(null);
  const { data: session } = useSession();
  const submitResult = useSubmitResult();
  const applyBoost = useApplyBoost();

  const canBoost = !!boostInfo?.canBoost && game.type === "COMPETITIVE";
  const boostMultiplier = boostInfo?.potentialMultiplier ?? 1;
  const boostPct = Math.round((1 - boostMultiplier) * 1000) / 10;

  const pressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pressTickRef = useRef<number>(0);
  const [pressingIdx, setPressingIdx] = useState<number | null>(null);
  const [pressProgress, setPressProgress] = useState<number>(0);

  function reset() {
    setRounds(Array.from({ length: numRounds }, emptyRound));
    setBoostedRoundIdx(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function updateRound(idx: number, patch: Partial<RoundState>) {
    setRounds((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    );
    if ("won" in patch && !patch.won && boostedRoundIdx === idx) {
      setBoostedRoundIdx(null);
    }
  }

  function toggleBoost(idx: number) {
    setBoostedRoundIdx((prev) => (prev === idx ? null : idx));
  }

  function startPress(idx: number) {
    if (boostedRoundIdx === idx) {
      toggleBoost(idx);
      return;
    }
    setPressingIdx(idx);
    setPressProgress(0);
    pressTickRef.current = 0;
    const totalTicks = 125; // ~2000ms at 16ms per tick
    pressTimerRef.current = setInterval(() => {
      pressTickRef.current += 1;
      const progress = Math.min((pressTickRef.current / totalTicks) * 100, 100);
      setPressProgress(progress);
      if (pressTickRef.current >= totalTicks) {
        clearInterval(pressTimerRef.current!);
        pressTimerRef.current = null;
        setPressingIdx(null);
        setPressProgress(0);
        toggleBoost(idx);
      }
    }, 16);
  }

  function cancelPress() {
    if (pressTimerRef.current) {
      clearInterval(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    setPressingIdx(null);
    setPressProgress(0);
  }

  function getNumericValue(r: RoundState): number {
    if (isTime) {
      return parseInt(r.minutes || "0") * 60 + parseInt(r.seconds || "0");
    }
    return parseInt(r.value);
  }

  function getBoostPreview(
    idx: number,
  ): { before: number; after: number } | null {
    const r = rounds[idx];
    if (!r.won) return null;
    const raw = getNumericValue(r);
    if (isNaN(raw) || raw <= 0) return null;
    const after = game.lowerIsBetter
      ? Math.round(raw * boostMultiplier * 10) / 10
      : Math.round(raw * (2 - boostMultiplier) * 10) / 10;
    return { before: raw, after };
  }

  function getBoostTooltip(idx: number): string {
    const preview = getBoostPreview(idx);
    const streakLine = `🔥 ${boostInfo?.currentStreak ?? 0} dias de streak`;
    const pctLine = `⚡ Melhoria de ${boostPct}%`;
    const warningLine = `⚠️ Usar vai zerar sua streak!`;
    if (!preview) return [streakLine, pctLine, warningLine].join("\n");
    const suffix = game.resultSuffix ? ` ${game.resultSuffix}` : "";
    const previewLine = `${preview.before}${suffix} → ${preview.after}${suffix}`;
    return [streakLine, pctLine, previewLine, warningLine].join("\n");
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

    const today = getToday();

    const roundsPayload = rounds.map((r, i) => {
      const won = r.won;
      const value = won ? getNumericValue(r) : (game.resultMax ?? 0) + 1;
      return {
        round: i + 1,
        value,
        status: (won ? "WIN" : "LOSS") as ResultStatus,
      };
    });

    const result = await submitResult.mutateAsync({
      playedAt: today,
      gameId: game.id,
      ...(game.type === "COMPETITIVE" && session?.user?.id
        ? { userId: session.user.id }
        : {}),
      rounds: roundsPayload,
    });

    if (canBoost && boostedRoundIdx !== null) {
      const results = Array.isArray(result) ? result : [result];
      const target = results.find((r) => r.round === boostedRoundIdx + 1);
      if (target) {
        await applyBoost.mutateAsync(target.id);
      }
    }

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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              style={{ display: "contents" }}
            >
              <Dialog.Body px={8} py={10}>
                <VStack gap={6}>
                  {/* Icon header */}
                  <Square
                    borderRadius="lg"
                    bgColor={
                      boostedRoundIdx !== null ? "purple.500" : "brand.solid"
                    }
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
                    <Text
                      mt={1}
                      fontSize="sm"
                      color="gray.500"
                      fontWeight="600"
                    >
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
                  {rounds.map((round, idx) => {
                    const isBoosted = boostedRoundIdx === idx;
                    return (
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
                                borderColor={
                                  round.won ? "brand.solid" : "gray.200"
                                }
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
                                borderColor={
                                  !round.won ? "red.500" : "gray.200"
                                }
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
                                      updateRound(idx, {
                                        minutes: e.target.value,
                                      })
                                    }
                                    rounded="xl"
                                    borderWidth={2}
                                    borderColor={
                                      isBoosted ? "purple.400" : "gray.200"
                                    }
                                    textAlign="center"
                                    fontSize={isMultiRound ? "xl" : "2xl"}
                                    fontWeight="800"
                                    py={isMultiRound ? 4 : 6}
                                    _focus={{
                                      borderColor: isBoosted
                                        ? "purple.500"
                                        : "brand.solid",
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
                                      updateRound(idx, {
                                        seconds: e.target.value,
                                      })
                                    }
                                    rounded="xl"
                                    borderWidth={2}
                                    borderColor={
                                      isBoosted ? "purple.400" : "gray.200"
                                    }
                                    textAlign="center"
                                    fontSize={isMultiRound ? "xl" : "2xl"}
                                    fontWeight="800"
                                    py={isMultiRound ? 4 : 6}
                                    _focus={{
                                      borderColor: isBoosted
                                        ? "purple.500"
                                        : "brand.solid",
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
                                    game.resultMax
                                      ? `0 – ${game.resultMax}`
                                      : "0"
                                  }
                                  value={round.value}
                                  onChange={(e) =>
                                    updateRound(idx, { value: e.target.value })
                                  }
                                  rounded="xl"
                                  borderWidth={2}
                                  borderColor={
                                    isBoosted ? "purple.400" : "gray.200"
                                  }
                                  textAlign="center"
                                  fontSize={isMultiRound ? "xl" : "3xl"}
                                  fontWeight="800"
                                  py={isMultiRound ? 4 : 7}
                                  _focus={{
                                    borderColor: isBoosted
                                      ? "purple.500"
                                      : "brand.solid",
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

                            {/* Boost toggle button */}
                            {canBoost && isRoundValid(round) && (
                              <Tooltip
                                content={
                                  isBoosted
                                    ? "Toque para desativar"
                                    : "Segure para ativar"
                                }
                                showArrow
                                openDelay={300}
                                closeDelay={100}
                                disabled={pressingIdx === idx}
                              >
                                <Button
                                  _hover={{
                                    bg: isBoosted ? "gray.100" : "undefined",
                                  }}
                                  type="button"
                                  w="full"
                                  mt={2}
                                  position="relative"
                                  overflow="hidden"
                                  variant={"solid"}
                                  bg={isBoosted ? "gray.50" : "purple.500"}
                                  rounded="xl"
                                  fontWeight="700"
                                  color={isBoosted ? "purple.500" : "white"}
                                  userSelect="none"
                                  onMouseDown={() => startPress(idx)}
                                  onMouseUp={cancelPress}
                                  onMouseLeave={cancelPress}
                                  onTouchStart={() => startPress(idx)}
                                  onTouchEnd={cancelPress}
                                  boxShadow={
                                    boostedRoundIdx !== null
                                      ? "undefined"
                                      : "0 4px 0 0 var(--chakra-colors-purple-200)"
                                  }
                                >
                                  {pressingIdx === idx && (
                                    <Box
                                      position="absolute"
                                      left={0}
                                      top={0}
                                      h="full"
                                      w={`${pressProgress}%`}
                                      bg="purple.600"
                                      pointerEvents="none"
                                      transition="none"
                                      borderRadius="inherit"
                                    />
                                  )}
                                  <Flex
                                    position="relative"
                                    zIndex={1}
                                    align="center"
                                    gap={1}
                                  >
                                    <Bolt size={16} weight="BoldDuotone" />
                                    {isBoosted
                                      ? "Impulso Ativo"
                                      : `Usar Impulso ${boostMultiplier}%`}
                                  </Flex>
                                </Button>
                              </Tooltip>
                            )}

                            {/* Boost preview */}
                            {canBoost &&
                              isBoosted &&
                              (() => {
                                const preview = getBoostPreview(idx);
                                if (!preview) return null;
                                const suffix = game.resultSuffix
                                  ? ` ${game.resultSuffix}`
                                  : "";
                                return (
                                  <Box
                                    mt={2}
                                    py={4}
                                    px={2}
                                    borderRadius="xl"
                                    bgGradient={"to-br"}
                                    gradientFrom={"white"}
                                    gradientTo={"purple.100"}
                                    textAlign="center"
                                  >
                                    <Text
                                      fontSize="xs"
                                      fontWeight="700"
                                      color="purple.500"
                                      mb={1}
                                    >
                                      Seu resultado com impulso
                                    </Text>
                                    <Flex
                                      justify="center"
                                      align="center"
                                      gap={3}
                                    >
                                      <Text
                                        fontSize="md"
                                        fontWeight="800"
                                        color="gray.500"
                                        textDecoration="line-through"
                                      >
                                        {preview.before}
                                        {suffix}
                                      </Text>
                                      <Text color="gray.500">→</Text>
                                      <Text
                                        fontSize="md"
                                        fontWeight="800"
                                        color="purple.500"
                                      >
                                        {preview.after}
                                        {suffix}
                                      </Text>
                                    </Flex>
                                  </Box>
                                );
                              })()}
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
                    );
                  })}
                </VStack>
              </Dialog.Body>
              <Dialog.Footer pb={6}>
                <Stack w="full">
                  <Button
                    type="submit"
                    w="full"
                    size="lg"
                    bg={boostedRoundIdx !== null ? "purple.500" : "brand.solid"}
                    color="white"
                    rounded="xl"
                    fontWeight="800"
                    fontSize="md"
                    py={6}
                    _hover={{
                      bg:
                        boostedRoundIdx !== null
                          ? "purple.600"
                          : "brand.emphasized",
                    }}
                    boxShadow={
                      boostedRoundIdx !== null
                        ? "0 4px 0 0 var(--chakra-colors-purple-700)"
                        : "0 4px 0 0 var(--chakra-colors-brand-emphasized)"
                    }
                    _active={{
                      boxShadow: "none",
                      transform: "translateY(4px)",
                    }}
                    transition="all 0.1s"
                    disabled={!isValid()}
                    loading={submitResult.isPending || applyBoost.isPending}
                  >
                    {boostedRoundIdx !== null && (
                      <Bolt size={18} weight="BoldDuotone" />
                    )}
                    {boostedRoundIdx !== null
                      ? "Salvar com Impulso"
                      : "Salvar resultado"}
                  </Button>
                  {/* Streak warning when boost active */}
                  {canBoost && boostedRoundIdx !== null && (
                    <Text fontSize="xs" color="gray.400" textAlign="center">
                      O impulso vai zerar sua streak de{" "}
                      {boostInfo?.currentStreak} dias!
                    </Text>
                  )}
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
            </form>

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
