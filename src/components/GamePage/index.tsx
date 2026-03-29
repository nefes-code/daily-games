"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useGame } from "@/services/games/hooks";
import { useResults } from "@/services/results/hooks";
import { PlayGameModal } from "@/components/PlayGameModal";
import { useLoginModal } from "@/lib/login-modal-context";
import { GameIconDisplay } from "@/utils/game-icon";
import { PodiumCard } from "./components/PodiumCard";
import { ResultRow } from "./components/ResultRow";
import { formatValue, getToday } from "./helpers";
import type { GameResult } from "@/services/types";

export function GamePage({ slug }: { slug: string }) {
  const { data: game, isLoading: gameLoading } = useGame(slug);
  const { data: results, isLoading: resultsLoading } = useResults({
    gameId: game?.id,
  });
  const { data: session } = useSession();
  const { openLogin } = useLoginModal();
  const [playOpen, setPlayOpen] = useState(false);

  function handlePlay() {
    if (!session?.user) {
      openLogin();
      return;
    }
    setPlayOpen(true);
  }

  if (gameLoading || resultsLoading) {
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

  const todayResults = (results ?? []).filter(
    (r) => r.playedAt.split("T")[0] === todayStr,
  );

  const sorted = [...todayResults].sort((a, b) =>
    game.lowerIsBetter ? a.value - b.value : b.value - a.value,
  );

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  // Reordenar para pódio: [2º, 1º, 3º]
  const podiumOrder: (GameResult & { _rank: number })[] =
    top3.length === 3
      ? [
          { ...top3[1], _rank: 2 },
          { ...top3[0], _rank: 1 },
          { ...top3[2], _rank: 3 },
        ]
      : top3.map((r, i) => ({ ...r, _rank: i + 1 }));

  function playerName(r: GameResult) {
    return game!.type === "COOPERATIVE"
      ? `Time (${r.registeredBy.name})`
      : (r.user?.name ?? "—");
  }

  const totalPlayers = new Set(
    todayResults.map((r) => r.userId ?? r.registeredById),
  ).size;

  return (
    <VStack gap={8} align="stretch" maxW="680px" mx="auto" pt={2}>
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
            <Text
              fontSize="xl"
              fontWeight="800"
              letterSpacing="-0.03em"
              color="gray.900"
              lineHeight="1.1"
            >
              {game.name}
            </Text>
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

      {/* ── Pódio ── */}
      {top3.length > 0 && (
        <Grid
          templateColumns={`repeat(${Math.min(top3.length, 3)}, 1fr)`}
          gap={3}
          alignItems="end"
        >
          {podiumOrder.map((r) => (
            <PodiumCard
              key={r.id}
              rank={r._rank}
              name={playerName(r)}
              value={formatValue(r.value, game)}
              elevated={r._rank === 1}
              isCurrentUser={
                !!session?.user?.email &&
                session.user.email === (r.user?.email ?? r.registeredBy.email)
              }
            />
          ))}
        </Grid>
      )}

      {/* ── Stats ── */}
      <Grid templateColumns="repeat(3, 1fr)" gap={3}>
        {[
          { label: "Hoje", value: todayResults.length },
          { label: "Total", value: (results ?? []).length },
          { label: "Jogadores hoje", value: totalPlayers },
        ].map((s) => (
          <Box
            key={s.label}
            borderWidth={1}
            borderColor="gray.100"
            rounded="xl"
            p={4}
          >
            <Text
              fontSize="2xl"
              fontWeight="900"
              letterSpacing="-0.04em"
              color="gray.900"
              fontFamily="mono"
            >
              {s.value}
            </Text>
            <Text fontSize="xs" color="gray.400" fontWeight="500" mt={0.5}>
              {s.label}
            </Text>
          </Box>
        ))}
      </Grid>

      {/* ── Hoje ── */}
      <Box>
        <Flex align="baseline" justify="space-between" mb={4}>
          <Text
            fontSize="xs"
            fontWeight="800"
            color="gray.400"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            Hoje
          </Text>
          <Text
            fontSize="xs"
            color="gray.300"
            fontWeight="600"
            fontFamily="mono"
          >
            {todayStr}
          </Text>
        </Flex>

        {sorted.length === 0 ? (
          <Box
            borderWidth={1}
            borderColor="gray.100"
            rounded="xl"
            py={12}
            textAlign="center"
          >
            <Text fontSize="sm" color="gray.400" fontWeight="600" mb={3}>
              Nenhum resultado ainda hoje
            </Text>
            <Button
              size="sm"
              bg="brand.solid"
              color="white"
              rounded="lg"
              fontWeight="700"
              _hover={{ bg: "brand.emphasized" }}
              onClick={handlePlay}
            >
              Seja o primeiro
            </Button>
          </Box>
        ) : (
          <VStack gap={3} align="stretch">
            {rest.length > 0 && (
              <Box
                borderWidth={1}
                borderColor="gray.100"
                rounded="xl"
                overflow="hidden"
              >
                {rest.map((r, i) => (
                  <ResultRow
                    key={r.id}
                    rank={i + 4}
                    name={playerName(r)}
                    value={formatValue(r.value, game)}
                    isLast={i === rest.length - 1}
                  />
                ))}
              </Box>
            )}
          </VStack>
        )}
      </Box>

      {/* ── Histórico ── */}
      {(results ?? []).length > 0 && (
        <Box>
          <Text
            fontSize="xs"
            fontWeight="800"
            color="gray.400"
            textTransform="uppercase"
            letterSpacing="wider"
            mb={4}
          >
            Histórico
          </Text>
          <Box
            borderWidth={1}
            borderColor="gray.100"
            rounded="xl"
            overflow="hidden"
          >
            {(results ?? []).slice(0, 10).map((r, i, arr) => (
              <ResultRow
                key={r.id}
                name={playerName(r)}
                value={formatValue(r.value, game)}
                date={new Date(r.playedAt).toLocaleDateString("pt-BR")}
                isLast={i === arr.length - 1}
              />
            ))}
          </Box>
        </Box>
      )}

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
