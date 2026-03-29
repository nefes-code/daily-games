"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Circle,
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
import { PlayGameModal } from "@/components/play-game-modal";
import { useLoginModal } from "@/lib/login-modal-context";
import { GameIconDisplay } from "@/utils/game-icon";
import type { GameResult } from "@/services/types";

// ─── helpers ──────────────────────────────────────────────────────────────────

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
  if (game.resultMax) return `${value}/${game.resultMax}${suffix}`;
  return `${value}${suffix}`;
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_PALETTE = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

// ─── PodiumCard ───────────────────────────────────────────────────────────────

const RANK_GRADIENT = [
  "linear-gradient(135deg, #fef9c3 0%, #fde68a 45%, #d9f99d 100%)",
  "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 45%, #ddd6fe 100%)",
  "linear-gradient(135deg, #ffedd5 0%, #fed7aa 45%, #fef9c3 100%)",
];
const RANK_BADGE_BG = ["#78350f", "#1e293b", "#7c2d12"];
const RANK_SUBTITLE = ["#d97706", "#6366f1", "#ea580c"];
const RANK_LABEL = ["1º", "2º", "3º"];

function PodiumCard({
  rank,
  name,
  value,
  elevated,
  isCurrentUser,
}: {
  rank: number;
  name: string;
  value: string;
  elevated?: boolean;
  isCurrentUser?: boolean;
}) {
  const gradient = RANK_GRADIENT[rank - 1];
  const badgeBg = RANK_BADGE_BG[rank - 1];
  const subtitleColor = RANK_SUBTITLE[rank - 1];
  const label = RANK_LABEL[rank - 1];

  return (
    <Box
      bg="white"
      rounded="2xl"
      overflow="hidden"
      borderWidth={1}
      borderColor={isCurrentUser ? "brand.solid" : "gray.100"}
      transform={elevated ? "translateY(-14px)" : undefined}
      boxShadow={
        elevated ? "0 16px 48px rgba(0,0,0,0.11)" : "0 1px 4px rgba(0,0,0,0.05)"
      }
    >
      {/* Gradient header */}
      <Box style={{ background: gradient }} position="relative" p={4} pb={7}>
        {/* Rank watermark */}
        <Text
          position="absolute"
          right={3}
          top={1}
          fontSize="6xl"
          fontWeight="900"
          lineHeight="1"
          fontFamily="mono"
          userSelect="none"
          pointerEvents="none"
          style={{ color: "rgba(0,0,0,0.10)" }}
        >
          {label}
        </Text>

        {/* Avatar */}
        <Circle
          size="52px"
          bg={avatarColor(name)}
          color="white"
          fontWeight="800"
          fontSize="sm"
          borderWidth={2}
          borderColor="white"
          style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
        >
          {getInitials(name)}
        </Circle>
      </Box>

      {/* Score badge — overlaps gradient border */}
      <Flex px={4} mt={-3.5} mb={2} justify="flex-end">
        <Box
          style={{
            background: badgeBg,
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
          }}
          color="white"
          px={3}
          py={1}
          rounded="full"
          fontSize="xs"
          fontWeight="800"
          fontFamily="mono"
          letterSpacing="0.02em"
        >
          {value}
        </Box>
      </Flex>

      {/* Content */}
      <Box px={4} pb={4}>
        <Text
          fontSize="sm"
          fontWeight="800"
          color="gray.900"
          lineClamp={1}
          letterSpacing="-0.01em"
        >
          {name}
        </Text>
        <Text
          fontSize="xs"
          fontWeight="600"
          mt={0.5}
          style={{ color: subtitleColor }}
        >
          {label} lugar
        </Text>
      </Box>
    </Box>
  );
}

// ─── ResultRow ────────────────────────────────────────────────────────────────

function ResultRow({
  rank,
  name,
  value,
  date,
  isLast,
}: {
  rank?: number;
  name: string;
  value: string;
  date?: string;
  isLast?: boolean;
}) {
  return (
    <Flex
      align="center"
      px={4}
      py={3}
      gap={3}
      borderBottomWidth={isLast ? 0 : 1}
      borderColor="gray.50"
      _hover={{ bg: "gray.50" }}
      transition="background 0.1s"
    >
      {rank !== undefined && (
        <Text
          fontSize="xs"
          fontWeight="700"
          color="gray.300"
          w={5}
          textAlign="center"
          fontFamily="mono"
          flexShrink={0}
        >
          {rank}
        </Text>
      )}
      <Circle
        size="30px"
        bg={avatarColor(name)}
        color="white"
        fontWeight="700"
        fontSize="xs"
        flexShrink={0}
      >
        {getInitials(name)}
      </Circle>
      <Text fontSize="sm" fontWeight="600" flex={1} truncate color="gray.700">
        {name}
      </Text>
      {date && (
        <Text fontSize="xs" color="gray.300" fontWeight="500" flexShrink={0}>
          {date}
        </Text>
      )}
      <Text
        fontSize="sm"
        fontWeight="800"
        color="gray.600"
        fontFamily="mono"
        flexShrink={0}
      >
        {value}
      </Text>
    </Flex>
  );
}

// ─── GamePage ─────────────────────────────────────────────────────────────────

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
            {/* 4º em diante */}
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
