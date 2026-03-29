"use client";

import { Circle, Flex, Text } from "@chakra-ui/react";
import { getInitials, avatarColor } from "../../helpers";

export function ResultRow({
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
