"use client";

import { Box, Flex, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { Leaderboard, type LeaderboardEntry } from "@/components/leaderboard";

// Mock data — será substituído por um endpoint real depois
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Pedro", value: "142 pts" },
  { rank: 2, name: "Lucas", value: "128 pts" },
  { rank: 3, name: "Matheus", value: "115 pts" },
  { rank: 4, name: "Gabriel", value: "98 pts" },
  { rank: 5, name: "Rafael", value: "87 pts" },
];

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Box
      bg="white"
      rounded="2xl"
      borderWidth={2}
      borderColor="gray.200"
      p={5}
      textAlign="center"
      transition="transform 0.15s"
      _hover={{ transform: "scale(1.03)" }}
    >
      <Text fontSize="3xl" mb={1}>
        {icon}
      </Text>
      <Text fontSize="2xl" fontWeight="800" color={color}>
        {value}
      </Text>
      <Text fontSize="sm" fontWeight="600" color="gray.500">
        {label}
      </Text>
    </Box>
  );
}

export function HomePage() {
  return (
    <VStack gap={8} align="stretch" maxW="800px" mx="auto">
      {/* Header */}
      <Box textAlign="center">
        <Text fontSize="4xl" mb={2}>
          🏆
        </Text>
        <Text fontSize="2xl" fontWeight="800" color="gray.800">
          Ranking Geral
        </Text>
        <Text fontSize="md" color="gray.500" fontWeight="600">
          Quem tá dominando os jogos diários?
        </Text>
      </Box>

      {/* Stats rápidos */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        <StatCard
          icon="🔥"
          label="Dias seguidos"
          value="7"
          color="orange.500"
        />
        <StatCard icon="🎯" label="Jogos hoje" value="3/5" color="brand.fg" />
        <StatCard
          icon="👥"
          label="Jogadores ativos"
          value="5"
          color="blue.500"
        />
      </SimpleGrid>

      {/* Leaderboard geral */}
      <Leaderboard
        entries={MOCK_LEADERBOARD}
        title="🏅 Leaderboard Semanal"
        subtitle="Pontuação acumulada desta semana"
      />

      {/* Hint */}
      <Flex
        justify="center"
        align="center"
        gap={2}
        py={4}
        px={6}
        bg="brand.subtle"
        rounded="2xl"
        borderWidth={2}
        borderColor="brand.solid"
      >
        <Text fontSize="xl">💡</Text>
        <Text fontWeight="700" color="brand.emphasized" fontSize="sm">
          Selecione um jogo na barra lateral para ver o ranking e jogar!
        </Text>
      </Flex>
    </VStack>
  );
}
