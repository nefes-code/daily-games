"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Separator,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { InfoCircle } from "@solar-icons/react";
import { LeaderboardInfoModal } from "@/components/LeaderboardInfoModal";
import { useSession } from "next-auth/react";
import { useGame, useLeaderboard } from "@/services/games/hooks";
import { useResults } from "@/services/results/hooks";
import { PlayGameModal } from "@/components/PlayGameModal";
import { useLoginModal } from "@/lib/login-modal-context";
import { useAddReaction, useRemoveReaction } from "@/services/reactions/hooks";
import { GameIconDisplay } from "@/utils/game-icon";
import { formatDateBR } from "@/utils/date";
import { PodiumCard } from "./components/PodiumCard";
import { ResultRow } from "./components/ResultRow";
import { formatValue, formatRoundValue, getToday } from "./helpers";
import type { GameResult } from "@/services/types";
import Link from "next/link";

export function GamePage({ slug }: { slug: string }) {
  const { data: game, isLoading: gameLoading } = useGame(slug);
  const { data: leaderboard, isLoading: lbLoading } = useLeaderboard(slug);
  const { data: results, isLoading: resultsLoading } = useResults({
    gameId: game?.id,
  });
  const { data: session } = useSession();
  const { openLogin } = useLoginModal();
  const [playOpen, setPlayOpen] = useState(false);
  const [lbInfoOpen, setLbInfoOpen] = useState(false);
  const addReaction = useAddReaction(game?.id ?? "");
  const removeReaction = useRemoveReaction(game?.id ?? "");

  function handlePlay() {
    if (!session?.user) {
      openLogin();
      return;
    }
    setPlayOpen(true);
  }

  if (gameLoading || resultsLoading || lbLoading) {
    return (
      <Flex justify="center" py={20}>
        <Spinner size="xl" color="brand.solid" />
      </Flex>
    );
  }

  if (!game) {
    return (
      <Box textAlign="center" py={20}>
        <Text fontSize="lg" fontWeight="700" color="gray.400">
          Jogo não encontrado
        </Text>
      </Box>
    );
  }

  const todayStr = getToday();

  // ── Leaderboard do endpoint (top 3 all-time) ──
  const top3 = leaderboard ?? [];
  const isCooperative = game.type === "COOPERATIVE";

  // Competitivo: sempre 3 entradas — preenche posições vazias com placeholder
  const filled = [0, 1, 2].map(
    (i) => top3[i] ?? { rank: i + 1, name: "", empty: true },
  );

  // ── Resultados de hoje ──
  const todayResults = (results ?? []).filter(
    (r) => r.playedAt.split("T")[0] === todayStr,
  );

  const isMultiRound = (game.resultRounds ?? 1) > 1;

  // Agrupa rodadas por jogador (userId ou registeredById para coop)
  type GroupedResult = {
    key: string;
    playerName: string;
    image: string | null | undefined;
    userId: string | null;
    registeredById: string;
    totalValue: number;
    rounds: GameResult[];
    reactions: GameResult["reactions"];
    mainResultId: string;
  };

  const groupedToday: GroupedResult[] = (() => {
    if (!isMultiRound) {
      // Single round — retorna como antes, 1 resultado por grupo
      return todayResults.map((r) => ({
        key: r.id,
        playerName:
          game!.type === "COOPERATIVE"
            ? `Time (${r.registeredBy.name})`
            : (r.user?.name ?? "—"),
        image: r.user?.image,
        userId: r.userId,
        registeredById: r.registeredById,
        totalValue: r.value,
        rounds: [r],
        reactions: r.reactions,
        mainResultId: r.id,
      }));
    }

    // Multi-round — agrupa por (userId ou registeredById) + playedAt
    const groups = new Map<string, GameResult[]>();
    for (const r of todayResults) {
      const key =
        game!.type === "COOPERATIVE"
          ? r.registeredById
          : (r.userId ?? r.registeredById);
      const existing = groups.get(key) ?? [];
      existing.push(r);
      groups.set(key, existing);
    }

    return Array.from(groups.entries()).map(([key, roundResults]) => {
      const first = roundResults[0];
      const sorted = [...roundResults].sort((a, b) => a.round - b.round);
      const totalValue = sorted.reduce((sum, r) => sum + r.value, 0);
      // Collect all reactions from all rounds
      const allReactions = sorted.flatMap((r) => r.reactions);
      return {
        key,
        playerName:
          game!.type === "COOPERATIVE"
            ? `Time (${first.registeredBy.name})`
            : (first.user?.name ?? "—"),
        image: first.user?.image,
        userId: first.userId,
        registeredById: first.registeredById,
        totalValue,
        rounds: sorted,
        reactions: allReactions,
        mainResultId: first.id,
      };
    });
  })();

  const sortedToday = [...groupedToday].sort((a, b) =>
    game.lowerIsBetter
      ? a.totalValue - b.totalValue
      : b.totalValue - a.totalValue,
  );

  const hasPlayedToday =
    !!session?.user &&
    sortedToday.some(
      (g) =>
        g.userId === session.user!.id || g.registeredById === session.user!.id,
    );

  const todayLabel = formatDateBR(todayStr);

  return (
    <VStack gap={8} align="stretch" maxW="850px" mx="auto" pt={2}>
      {/* ── Header ── */}
      <Flex align="center" justify="space-between" gap={4} flexWrap="wrap">
        <HStack gap={3}>
          <Flex
            w={10}
            h={10}
            rounded="xl"
            bg="brand.solid"
            align="center"
            justify="center"
            color="white"
            flexShrink={0}
          >
            <GameIconDisplay icon={game.icon} />
          </Flex>
          <Box>
            <Link href={`${game.url}`} target="_blank">
              <Text
                _hover={{
                  textDecor: "underline",
                }}
                fontSize="xl"
                fontWeight="800"
                letterSpacing="-0.03em"
                color="gray.900"
                lineHeight="1.1"
              >
                {game.name}
              </Text>
            </Link>
            <Text fontSize="xs" color="gray.400" fontWeight="500" mt={0.5}>
              {game.type === "COOPERATIVE" ? "Cooperativo" : "Competitivo"}
              {" · "}
              {game.resultType === "TIME" ? "Tempo" : "Pontuação"}
              {game.lowerIsBetter ? " · Menor é melhor" : ""}
            </Text>
          </Box>
        </HStack>

        <Button
          bg="brand.solid"
          color="white"
          rounded="lg"
          fontWeight="700"
          px={5}
          size="sm"
          _hover={{ bg: "brand.emphasized" }}
          onClick={handlePlay}
        >
          Jogar hoje
        </Button>
      </Flex>

      {/* ── Pódio all-time ── */}
      {isCooperative ? (
        // Cooperativo: card único do time
        <Box pt={4}>
          {top3[0] ? (
            <PodiumCard
              rank={1}
              wide
              name={top3[0].name}
              value={formatValue(top3[0].average, game)}
              daysPlayed={top3[0].daysPlayed}
              totalDays={top3[0].totalDays}
              bestResult={formatValue(top3[0].bestResult, game)}
            />
          ) : (
            <PodiumCard rank={1} wide empty />
          )}
        </Box>
      ) : (
        // Competitivo: pódio com 3 cards
        <SimpleGrid
          columns={{ base: 1, md: 3 }}
          gap={{ base: 2, md: 3 }}
          position="relative"
          pt={{ base: 2, md: 16 }}
          mt={4}
          alignItems="end"
        >
          <Flex
            w="100%"
            justifyContent="center"
            position="absolute"
            top={{ base: -4, md: -12 }}
            color="blackAlpha.100"
            display={{ base: "none", md: "flex" }}
          >
            <Text fontSize="9xl" fontWeight="extrabold">
              LEADERBOARD
            </Text>
          </Flex>
          {filled.map((p) => {
            const orderMap: Record<number, { base: number; md: number }> = {
              1: { base: 0, md: 1 },
              2: { base: 1, md: 0 },
              3: { base: 2, md: 2 },
            };
            return (
              <Box key={p.rank} order={orderMap[p.rank]}>
                {"empty" in p ? (
                  <PodiumCard rank={p.rank} empty />
                ) : (
                  <PodiumCard
                    rank={p.rank}
                    name={p.name}
                    value={formatValue(p.average, game)}
                    image={p.image}
                    daysPlayed={p.daysPlayed}
                    totalDays={p.totalDays}
                    bestResult={formatValue(p.bestResult, game)}
                    streak={p.streak}
                  />
                )}
              </Box>
            );
          })}
        </SimpleGrid>
      )}

      <Stack justify="center" align="center" gap={1} mt={-4}>
        <Text fontSize="xs" color="gray.400">
          Ranking dos últimos 30 dias
        </Text>
        <Button
          size={"2xs"}
          variant={"ghost"}
          onClick={() => setLbInfoOpen(true)}
        >
          Como funciona o ranking?
        </Button>
      </Stack>

      <Separator my={8} width={"100%"} borderColor={"gray.100"} />

      {/* ── Resultados de hoje ── */}
      <Box>
        <HStack width="100%" justify="space-between" mb={5}>
          <Text
            fontSize={{ base: "xl", md: "3xl" }}
            fontWeight="900"
            letterSpacing="-0.04em"
            color="gray.900"
            lineHeight="1"
          >
            Resultados de hoje
          </Text>
          <Text fontSize="xl" color="gray.400" fontWeight="500" mt={1}>
            {todayLabel}
          </Text>
        </HStack>

        <Box
          borderWidth={1}
          borderColor="gray.100"
          rounded="xl"
          overflow="hidden"
        >
          {sortedToday.map((g, i) => (
            <Box key={g.key}>
              <ResultRow
                rank={i + 1}
                name={g.playerName}
                value={formatValue(g.totalValue, game)}
                isLast={i === sortedToday.length - 1}
                isFirst={i === 0}
                reactions={g.reactions}
                image={g.image}
                currentUserId={session?.user?.id ?? null}
                onReact={(emoji) =>
                  addReaction.mutate({ resultId: g.mainResultId, emoji })
                }
                onRemoveReaction={() => removeReaction.mutate(g.mainResultId)}
                rounds={
                  isMultiRound && g.rounds.length > 1
                    ? g.rounds.map((r) => ({
                        label: `R${r.round}: ${formatRoundValue(r.value, r.status, game)}`,
                        isLoss: r.status === "LOSS",
                      }))
                    : undefined
                }
              />
            </Box>
          ))}

          {/* CTA — aparece quando o usuário ainda não registrou resultado hoje */}
          {!hasPlayedToday && (
            <Flex
              align="center"
              justify={"center"}
              textAlign={"center"}
              px={4}
              py={3}
              gap={3}
              borderTopWidth={sortedToday.length > 0 ? 1 : 0}
              borderStyle="dashed"
              borderColor="gray.200"
              cursor="pointer"
              onClick={handlePlay}
              _hover={{ bg: "gray.100" }}
              transition="background 0.1s"
            >
              <HStack>
                <Flex
                  w="30px"
                  h="30px"
                  rounded="full"
                  borderWidth={1}
                  borderColor={"black"}
                  borderStyle="dashed"
                  align="center"
                  justify="center"
                  flexShrink={0}
                  fontSize="lg"
                  lineHeight="1"
                >
                  +
                </Flex>
                <Text fontSize="sm" flex={1}>
                  Faça o seu resultado
                </Text>
              </HStack>
            </Flex>
          )}
        </Box>
      </Box>

      {game && (
        <PlayGameModal
          game={game}
          open={playOpen}
          onClose={() => setPlayOpen(false)}
        />
      )}

      {game && (
        <LeaderboardInfoModal
          game={game}
          open={lbInfoOpen}
          onClose={() => setLbInfoOpen(false)}
        />
      )}
    </VStack>
  );
}
