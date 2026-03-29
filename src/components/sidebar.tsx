"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Circle,
  Flex,
  HStack,
  Image,
  Square,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Ranking, AddCircle } from "@solar-icons/react";
import Link from "next/link";
import { FaGoogle } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useGames } from "@/services/games/hooks";
import { CreateGameModal } from "@/components/create-game-modal";
import { useLoginModal } from "@/lib/login-modal-context";
import type { Game } from "@/services/types";

import pkg from "@/../package.json";
import { NefesLogo } from "./nefes-logo";
import { getGameIcon, type Icon as SolarIcon } from "@/utils/game-icon";
import { Gamepad } from "@solar-icons/react/ssr";

function NavItem({
  href,
  Icon,
  label,
  active,
}: {
  href: string;
  Icon: SolarIcon;
  label: string;
  active: boolean;
}) {
  return (
    <Box asChild w="full">
      <Link href={href}>
        <Button
          _hover={{
            bgColor: "brand.solid",
            color: "white",
          }}
          bgColor={active ? "brand.solid/10" : "transparent"}
          borderRadius={"lg"}
          width={"100%"}
          height={10}
          justifyContent={"start"}
          variant={"ghost"}
          color={active ? "brand.solid" : undefined}
        >
          <Icon weight="BoldDuotone" />
          <Text>{label}</Text>
        </Button>
      </Link>
    </Box>
  );
}

function GameNavItem({ game, active }: { game: Game; active: boolean }) {
  return (
    <NavItem
      href={`/games/${game.slug ?? game.id}`}
      Icon={game.icon ? getGameIcon(game.icon) : Gamepad}
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
      w="240px"
      minH="100vh"
      bg="white"
      borderRightWidth={1}
      borderColor="gray.100"
      position="fixed"
      left={0}
      top={0}
      display="flex"
      flexDirection="column"
    >
      <HStack p={5} borderBottomWidth={1}>
        <Square
          borderRadius={"lg"}
          bgColor={"brand.solid"}
          size={9}
          color={"black"}
        >
          <NefesLogo />
        </Square>
        <Text fontSize={"lg"} fontWeight={"bold"}>
          Jogos diários
        </Text>
      </HStack>
      <VStack mt={4} px={2} gap={2} align="stretch">
        {/* Home */}
        <NavItem
          href="/"
          Icon={Ranking}
          label="Home"
          active={pathname === "/"}
        />

        {/* Competitivos */}
        {competitive.length > 0 && (
          <>
            <Text
              fontSize="xs"
              fontWeight="800"
              textTransform="uppercase"
              color="gray.400"
              mt={6}
              px={2}
              letterSpacing="wider"
              fontFamily={"mono"}
            >
              Competitivos
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
              mt={4}
              letterSpacing="wider"
              fontFamily={"mono"}
            >
              Cooperativos
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
        <Flex px={2}>
          <Button
            _hover={{
              bgColor: "brand.solid",
              color: "white",
            }}
            borderRadius={"lg"}
            width={"100%"}
            justifyContent={"start"}
            variant={"ghost"}
            color="brand.solid"
            onClick={() => setCreateOpen(true)}
          >
            <AddCircle weight="BoldDuotone" />
            Novo Jogo
          </Button>
        </Flex>

        {/* User section */}
        <Box mt={4} p={4} borderTopWidth={1} borderColor="gray.100">
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
              _hover={{
                bgColor: "brand.emphasized",
              }}
              borderRadius={"lg"}
              width={"100%"}
              variant={"solid"}
              bgColor={"brand.solid"}
              color="white"
              onClick={openLogin}
            >
              <FaGoogle />
              Entrar com Google
            </Button>
          )}
          <Text fontSize="2xs" color="gray.400" textAlign="center" mt={3}>
            v{pkg.version}
          </Text>
        </Box>
      </Box>
      <CreateGameModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </Box>
  );
}
