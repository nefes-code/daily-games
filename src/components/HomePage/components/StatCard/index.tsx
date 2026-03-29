"use client";

import { Box, Text } from "@chakra-ui/react";

export function StatCard({
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
