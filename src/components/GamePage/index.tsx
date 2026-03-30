"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  Separator,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useGame, useLeaderboard } from "@/services/games/hooks";
import { useResults } from "@/services/results/hooks";
import { PlayGameModal } from "@/components/PlayGameModal";
import { useLoginModal } from "@/lib/login-modal-context";
import { useAddReaction, useRemoveReaction } from "@/services/reactions/hooks";
import { GameIconDisplay } from "@/utils/game-icon";
import { PodiumCard } from "./components/PodiumCard";
import { ResultRow } from "./components/ResultRow";
import { formatValue, getToday } from "./helpers";
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
  // Reordenar para pódio visual: [2º, 1º, 3º]
  const podiumOrder = [filled[1], filled[0], filled[2]];

  // ── Resultados de hoje ──
  const todayResults = (results ?? []).filter(
    (r) => r.playedAt.split("T")[0] === todayStr,
  );

  const sortedToday = [...todayResults].sort((a, b) =>
    game.lowerIsBetter ? a.value - b.value : b.value - a.value,
  );

  function playerName(r: GameResult) {
    return game!.type === "COOPERATIVE"
      ? `Time (${r.registeredBy.name})`
      : (r.user?.name ?? "—");
  }

  const hasPlayedToday =
    !!session?.user &&
    todayResults.some(
      (r) =>
        r.userId === session.user!.id || r.registeredById === session.user!.id,
    );

  const todayLabel = new Date(todayStr + "T12:00:00").toLocaleDateString(
    "pt-BR",
    { day: "2-digit", month: "2-digit" },
  );

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
              bestResult={formatValue(top3[0].bestResult, game)}
            />
          ) : (
            <PodiumCard rank={1} wide empty />
          )}
        </Box>
      ) : (
        // Competitivo: pódio com 3 cards
        <SimpleGrid
          columns={3}
          gap={3}
          position="relative"
          pt={16}
          mt={4}
          alignItems="end"
        >
          <Flex
            w="100%"
            justifyContent="center"
            position="absolute"
            top={-12}
            color="blackAlpha.100"
          >
            <Text fontSize="9xl" fontWeight="extrabold">
              LEADERBOARD
            </Text>
          </Flex>
          {podiumOrder.map((p) =>
            "empty" in p ? (
              <PodiumCard key={p.rank} rank={p.rank} empty />
            ) : (
              <PodiumCard
                key={p.name}
                rank={p.rank}
                name={p.name}
                value={formatValue(p.average, game)}
                image={p.image}
                daysPlayed={p.daysPlayed}
                bestResult={formatValue(p.bestResult, game)}
              />
            ),
          )}
        </SimpleGrid>
      )}

      <Text fontSize="xs" color="gray.400" textAlign="center" mt={-4}>
        Ranking com base nos últimos 30 dias
      </Text>

      <Separator my={8} width={"100%"} borderColor={"gray.100"} />

      {/* ── Resultados de hoje ── */}
      <Box>
        <HStack width="100%" justify="space-between" mb={5}>
          <Text
            fontSize="3xl"
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
          {sortedToday.map((r, i) => (
            <ResultRow
              key={r.id}
              rank={i + 1}
              name={playerName(r)}
              value={formatValue(r.value, game)}
              isLast={i === sortedToday.length - 1 && hasPlayedToday}
              reactions={r.reactions}
              image={r.user?.image}
              currentUserId={session?.user?.id ?? null}
              onReact={(emoji) => addReaction.mutate({ resultId: r.id, emoji })}
              onRemoveReaction={() => removeReaction.mutate(r.id)}
            />
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
    </VStack>
  );
}
