"use client";

import { Box, Flex, Text, VStack, Circle } from "@chakra-ui/react";

export type LeaderboardEntry = {
  rank: number;
  name: string;
  value: string;
  isCurrentUser?: boolean;
};

const MEDAL_COLORS: Record<number, { bg: string; emoji: string }> = {
  1: { bg: "#FFD700", emoji: "🥇" },
  2: { bg: "#C0C0C0", emoji: "🥈" },
  3: { bg: "#CD7F32", emoji: "🥉" },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "#58CC02",
  "#CE82FF",
  "#00CD9C",
  "#1CB0F6",
  "#FF9600",
  "#FF4B4B",
  "#FFC800",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function Leaderboard({
  entries,
  title,
  subtitle,
}: {
  entries: LeaderboardEntry[];
  title?: string;
  subtitle?: string;
}) {
  return (
    <Box
      bg="bg.panel"
      rounded="2xl"
      borderWidth={2}
      borderColor="border"
      overflow="hidden"
    >
      {/* Header */}
      {title && (
        <Box textAlign="center" pt={6} pb={4} px={6}>
          <Text fontSize="lg" fontWeight="800" color="fg">
            {title}
          </Text>
          {subtitle && (
            <Text fontSize="sm" color="fg.muted" mt={1}>
              {subtitle}
            </Text>
          )}
        </Box>
      )}

      {/* Entries */}
      <VStack gap={0} align="stretch">
        {entries.map((entry) => {
          const medal = MEDAL_COLORS[entry.rank];
          const isHighlighted = entry.isCurrentUser;

          return (
            <Flex
              key={entry.rank + entry.name}
              align="center"
              px={6}
              py={3}
              bg={isHighlighted ? "brand.subtle" : "transparent"}
              borderBottomWidth={1}
              borderColor="border.muted"
              transition="background 0.1s"
              _hover={{ bg: isHighlighted ? "brand.subtle" : "bg.subtle" }}
              _last={{ borderBottomWidth: 0 }}
            >
              {/* Rank */}
              <Text
                fontSize="md"
                fontWeight="800"
                color={medal ? medal.bg : "fg.subtle"}
                w="36px"
                textAlign="center"
                flexShrink={0}
              >
                {medal ? medal.emoji : entry.rank}
              </Text>

              {/* Avatar */}
              <Circle
                size="40px"
                bg={getAvatarColor(entry.name)}
                color="white"
                fontWeight="800"
                fontSize="sm"
                flexShrink={0}
                mx={3}
              >
                {getInitials(entry.name)}
              </Circle>

              {/* Name */}
              <Text fontWeight="700" fontSize="md" flex={1} truncate>
                {entry.name}
              </Text>

              {/* Value */}
              <Text fontWeight="800" fontSize="md" color="fg.muted">
                {entry.value}
              </Text>
            </Flex>
          );
        })}

        {entries.length === 0 && (
          <Box py={8} textAlign="center">
            <Text fontSize="3xl" mb={2}>
              🏆
            </Text>
            <Text color="fg.subtle" fontWeight="600">
              Nenhum resultado ainda
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
