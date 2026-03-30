"use client";

import { Center, Stack, Text, VStack } from "@chakra-ui/react";
import { Sledgehammer } from "@solar-icons/react";

export function HomePage() {
  return (
    <VStack gap={8} align="stretch" maxW="800px" mx="auto">
      <Center height={"90vh"} w={"100%"}>
        <Stack color="brand.solid" alignItems="center" gap={4}>
          <Sledgehammer size={50} weight="BoldDuotone" />
          <Text>Tela em construção</Text>
        </Stack>
      </Center>
    </VStack>
  );
}
