"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Circle,
  Flex,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useGames } from "@/services/games/hooks";
import { CreateGameModal } from "@/components/create-game-modal";
import { useLoginModal } from "@/lib/login-modal-context";
import type { Game } from "@/services/types";

import pkg from "@/../package.json";

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: string;
  label: string;
  active: boolean;
}) {
  return (
    <Box asChild w="full">
      <Link href={href}>
        <Flex
          align="center"
          gap={3}
          px={4}
          py={3}
          rounded="xl"
          fontWeight="bold"
          fontSize="md"
          transition="all 0.15s"
          bg={active ? "brand.subtle" : "transparent"}
          color={active ? "brand.fg" : "gray.600"}
          borderWidth={2}
          borderColor={active ? "brand.solid" : "transparent"}
          _hover={{
            bg: active ? "brand.subtle" : "gray.100",
          }}
        >
          <Text fontSize="xl">{icon}</Text>
          <Text>{label}</Text>
        </Flex>
      </Link>
    </Box>
  );
}

function GameNavItem({ game, active }: { game: Game; active: boolean }) {
  return (
    <NavItem
      href={`/games/${game.id}`}
      icon={game.type === "COOPERATIVE" ? "🤝" : "⚔️"}
      label={game.name}
      active={active}
    />
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: games } = useGames();
  const { data: session } = useSession();
  const { openLogin } = useLoginModal();
  const [createOpen, setCreateOpen] = useState(false);

  const competitive = games?.filter((g) => g.type === "COMPETITIVE") ?? [];
  const cooperative = games?.filter((g) => g.type === "COOPERATIVE") ?? [];

  return (
    <Box
      as="aside"
      w="260px"
      minH="100vh"
      bg="white"
      borderRightWidth={2}
      borderColor="gray.200"
      py={6}
      px={4}
      position="fixed"
      left={0}
      top={0}
      display="flex"
      flexDirection="column"
    >
      <VStack gap={2} align="stretch">
        {/* Logo */}
        <Flex align="center" gap={2} px={4} mb={4}>
          <Text fontSize="2xl">🎮</Text>
          <Text fontSize="lg" fontWeight="800" color="brand.fg">
            Daily Games
          </Text>
        </Flex>

        {/* Home */}
        <NavItem href="/" icon="🏠" label="Home" active={pathname === "/"} />

        {/* Competitivos */}
        {competitive.length > 0 && (
          <>
            <Text
              fontSize="xs"
              fontWeight="800"
              textTransform="uppercase"
              color="gray.400"
              px={4}
              mt={4}
              letterSpacing="wider"
            >
              ⚔️ Competitivos
            </Text>
            {competitive.map((g) => (
              <GameNavItem
                key={g.id}
                game={g}
                active={pathname === `/games/${g.id}`}
              />
            ))}
          </>
        )}

        {/* Cooperativos */}
        {cooperative.length > 0 && (
          <>
            <Text
              fontSize="xs"
              fontWeight="800"
              textTransform="uppercase"
              color="gray.400"
              px={4}
              mt={4}
              letterSpacing="wider"
            >
              🤝 Cooperativos
            </Text>
            {cooperative.map((g) => (
              <GameNavItem
                key={g.id}
                game={g}
                active={pathname === `/games/${g.id}`}
              />
            ))}
          </>
        )}

        {/* Empty state */}
        {games && games.length === 0 && (
          <Text fontSize="sm" color="gray.400" px={4} mt={4} textAlign="center">
            Nenhum jogo cadastrado ainda
          </Text>
        )}
      </VStack>

      {/* Botão Novo Jogo fixo na parte inferior */}
      <Box mt="auto" pt={4}>
        <Button
          w="full"
          bg="brand.solid"
          color="white"
          rounded="xl"
          fontWeight="800"
          fontSize="md"
          py={6}
          _hover={{ bg: "brand.emphasized" }}
          onClick={() => setCreateOpen(true)}
          boxShadow="0 4px 0 0 var(--chakra-colors-brand-emphasized)"
          _active={{
            boxShadow: "none",
            transform: "translateY(4px)",
          }}
          transition="all 0.1s"
        >
          ➕ Novo Jogo
        </Button>

        {/* User section */}
        <Box mt={4} pt={4} borderTopWidth={1} borderColor="gray.200">
          {session?.user ? (
            <Flex align="center" gap={3}>
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "Avatar"}
                  w="36px"
                  h="36px"
                  rounded="full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Circle
                  size="36px"
                  bg="brand.solid"
                  color="white"
                  fontSize="sm"
                  fontWeight="800"
                >
                  {(session.user.name ?? "U")[0].toUpperCase()}
                </Circle>
              )}
              <Box flex={1} minW={0}>
                <Text fontSize="sm" fontWeight="700" truncate>
                  {session.user.name}
                </Text>
                <Text fontSize="xs" color="gray.400" truncate>
                  {session.user.email}
                </Text>
              </Box>
              <Button
                size="xs"
                variant="ghost"
                color="gray.400"
                _hover={{ color: "red.500" }}
                onClick={() => signOut()}
                title="Sair"
              >
                🚪
              </Button>
            </Flex>
          ) : (
            <Button
              w="full"
              variant="outline"
              rounded="xl"
              fontWeight="700"
              borderWidth={2}
              borderColor="gray.200"
              color="gray.600"
              _hover={{ bg: "gray.50", borderColor: "gray.300" }}
              onClick={openLogin}
            >
              🔑 Entrar
            </Button>
          )}
        </Box>
      </Box>

      <CreateGameModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <Text fontSize="2xs" color="gray.400" textAlign="center" mt={3}>
        v{pkg.version}
      </Text>
    </Box>
  );
}
