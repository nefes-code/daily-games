import { Container, Heading, Text, VStack } from "@chakra-ui/react";

export default function Home() {
  return (
    <Container maxW="4xl" py={10}>
      <VStack gap={4}>
        <Heading size="4xl">🎮 Daily Games</Heading>
        <Text fontSize="lg" color="fg.muted">
          Hub de jogos diários entre amigos
        </Text>
      </VStack>
    </Container>
  );
}
