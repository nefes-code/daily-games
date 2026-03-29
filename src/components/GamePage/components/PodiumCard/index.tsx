"use client";

import { Box, Circle, Flex, Text } from "@chakra-ui/react";
import { getInitials, avatarColor } from "../../helpers";

const RANK_GRADIENT = [
  "linear-gradient(135deg, #fef9c3 0%, #fde68a 45%, #d9f99d 100%)",
  "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 45%, #ddd6fe 100%)",
  "linear-gradient(135deg, #ffedd5 0%, #fed7aa 45%, #fef9c3 100%)",
];
const RANK_BADGE_BG = ["#78350f", "#1e293b", "#7c2d12"];
const RANK_SUBTITLE = ["#d97706", "#6366f1", "#ea580c"];
const RANK_LABEL = ["1º", "2º", "3º"];

export function PodiumCard({
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
