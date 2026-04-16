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
      bg="bg.panel"
      rounded="2xl"
      borderWidth={2}
      borderColor="border"
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
      <Text fontSize="sm" fontWeight="600" color="fg.muted">
        {label}
      </Text>
    </Box>
  );
}
