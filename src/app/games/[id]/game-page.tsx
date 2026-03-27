"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useGame } from "@/services/games/hooks";
import { useResults } from "@/services/results/hooks";
import { Leaderboard, type LeaderboardEntry } from "@/components/leaderboard";
import { PlayGameModal } from "@/components/play-game-modal";
import { useLoginModal } from "@/lib/login-modal-context";

function formatValue(
  value: number,
  game: {
    resultType: string;
    resultSuffix: string | null;
    resultMax: number | null;
  },
) {
  if (game.resultType === "TIME") {
    const mins = Math.floor(value / 60);
    const secs = value % 60;
    return mins > 0 ? `${mins}:${String(secs).padStart(2, "0")}` : `${secs}s`;
  }
  const suffix = game.resultSuffix ?? "";
  if (game.resultMax) {
    return `${value}/${game.resultMax}${suffix}`;
  }
  return `${value}${suffix}`;
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export function GamePage({ gameId }: { gameId: string }) {
  const { data: game, isLoading: gameLoading } = useGame(gameId);
  const { data: results, isLoading: resultsLoading } = useResults({ gameId });
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
        <Text fontSize="4xl" mb={2}>
          😕
        </Text>
        <Text fontSize="lg" fontWeight="700" color="gray.500">
          Jogo não encontrado
        </Text>
      </Box>
    );
  }

  // Construir leaderboard para resultados de hoje
  const todayStr = getToday();
  const todayResults = (results ?? []).filter(
    (r) => r.playedAt.split("T")[0] === todayStr,
  );

  const sorted = [...todayResults].sort((a, b) => {
    return game.lowerIsBetter ? a.value - b.value : b.value - a.value;
  });

  const leaderboardEntries: LeaderboardEntry[] = sorted.map((r, i) => ({
    rank: i + 1,
    name:
      game.type === "COOPERATIVE"
        ? `Time (por ${r.registeredBy.name})`
        : (r.user?.name ?? "Desconhecido"),
    value: formatValue(r.value, game),
  }));

  // Últimos resultados (últimos 10, qualquer dia)
  const recentResults = (results ?? []).slice(0, 10);

  return (
    <VStack gap={8} align="stretch" maxW="800px" mx="auto">
      {/* Game header */}
      <Box
        bg="white"
        rounded="2xl"
        borderWidth={2}
        borderColor="gray.200"
        p={6}
        textAlign="center"
      >
        <Text fontSize="4xl" mb={2}>
          {game.type === "COOPERATIVE" ? "🤝" : "⚔️"}
        </Text>
        <Text fontSize="2xl" fontWeight="800" color="gray.800">
          {game.name}
        </Text>
        <Flex justify="center" gap={3} mt={2} flexWrap="wrap">
          <Box
            bg={game.type === "COOPERATIVE" ? "purple.100" : "red.100"}
            color={game.type === "COOPERATIVE" ? "purple.700" : "red.700"}
            px={3}
            py={1}
            rounded="full"
            fontSize="xs"
            fontWeight="800"
          >
            {game.type === "COOPERATIVE" ? "Cooperativo" : "Competitivo"}
          </Box>
          <Box
            bg="blue.100"
            color="blue.700"
            px={3}
            py={1}
            rounded="full"
            fontSize="xs"
            fontWeight="800"
          >
            {game.resultType === "TIME" ? "⏱ Tempo" : "🎯 Pontuação"}
          </Box>
          {game.lowerIsBetter && (
            <Box
              bg="orange.100"
              color="orange.700"
              px={3}
              py={1}
              rounded="full"
              fontSize="xs"
              fontWeight="800"
            >
              ⬇ Menor é melhor
            </Box>
          )}
        </Flex>

        {/* Play button */}
        <Box mt={6}>
          <Button
            size="xl"
            bg="brand.solid"
            color="white"
            fontWeight="800"
            fontSize="lg"
            rounded="2xl"
            px={10}
            py={6}
            borderBottomWidth={4}
            borderColor="brand.emphasized"
            transition="all 0.1s"
            _hover={{
              bg: "brand.emphasized",
            }}
            _active={{
              borderBottomWidth: 1,
              transform: "translateY(3px)",
            }}
            onClick={handlePlay}
          >
            🎮 Jogar {game.name} de Hoje
          </Button>
        </Box>
      </Box>

      {game && (
        <PlayGameModal
          game={game}
          open={playOpen}
          onClose={() => setPlayOpen(false)}
        />
      )}

      {/* Stats rápidos do jogo */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        <Box
          bg="white"
          rounded="2xl"
          borderWidth={2}
          borderColor="gray.200"
          p={5}
          textAlign="center"
        >
          <Text fontSize="2xl" mb={1}>
            📊
          </Text>
          <Text fontSize="xl" fontWeight="800" color="gray.800">
            {todayResults.length}
          </Text>
          <Text fontSize="sm" fontWeight="600" color="gray.500">
            Resultados hoje
          </Text>
        </Box>
        <Box
          bg="white"
          rounded="2xl"
          borderWidth={2}
          borderColor="gray.200"
          p={5}
          textAlign="center"
        >
          <Text fontSize="2xl" mb={1}>
            🗓️
          </Text>
          <Text fontSize="xl" fontWeight="800" color="gray.800">
            {(results ?? []).length}
          </Text>
          <Text fontSize="sm" fontWeight="600" color="gray.500">
            Resultados total
          </Text>
        </Box>
        <Box
          bg="white"
          rounded="2xl"
          borderWidth={2}
          borderColor="gray.200"
          p={5}
          textAlign="center"
        >
          <Text fontSize="2xl" mb={1}>
            {game.resultType === "TIME" ? "⏱" : "🎯"}
          </Text>
          <Text fontSize="xl" fontWeight="800" color="gray.800">
            {game.resultMax ? `Max: ${game.resultMax}` : "—"}
          </Text>
          <Text fontSize="sm" fontWeight="600" color="gray.500">
            Resultado máximo
          </Text>
        </Box>
      </SimpleGrid>

      {/* Leaderboard de hoje */}
      <Leaderboard
        entries={leaderboardEntries}
        title={`🏅 Ranking de Hoje`}
        subtitle={todayStr}
      />

      {/* Últimos resultados */}
      {recentResults.length > 0 && (
        <Box
          bg="white"
          rounded="2xl"
          borderWidth={2}
          borderColor="gray.200"
          overflow="hidden"
        >
          <Box pt={5} pb={3} px={6}>
            <Text fontSize="lg" fontWeight="800" color="gray.800">
              📋 Últimos Resultados
            </Text>
          </Box>
          <VStack gap={0} align="stretch">
            {recentResults.map((r) => (
              <Flex
                key={r.id}
                px={6}
                py={3}
                borderTopWidth={1}
                borderColor="gray.100"
                align="center"
              >
                <Box flex={1}>
                  <Text fontWeight="700" fontSize="sm">
                    {game.type === "COOPERATIVE"
                      ? `Time (por ${r.registeredBy.name})`
                      : (r.user?.name ?? "—")}
                  </Text>
                  <Text fontSize="xs" color="gray.400" fontWeight="600">
                    {new Date(r.playedAt).toLocaleDateString("pt-BR")}
                  </Text>
                </Box>
                <Text fontWeight="800" color="gray.600">
                  {formatValue(r.value, game)}
                </Text>
              </Flex>
            ))}
          </VStack>
        </Box>
      )}
    </VStack>
  );
}
