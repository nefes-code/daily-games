"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Circle,
  Flex,
  HStack,
  IconButton,
  Image,
  Square,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Ranking, Logout, Fire } from "@solar-icons/react";
import { FaGoogle } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useGames } from "@/services/games/hooks";
import { useTodayPlayedGameIds } from "@/services/results/hooks";
import { useUserStreak } from "@/services/users/hooks";
import { StreakModal } from "@/components/StreakModal";
import {
  ReleaseNotesModal,
  getHasNewRelease,
} from "@/components/ReleaseNotesModal";
import { useLoginModal } from "@/lib/login-modal-context";
import { NefesLogo } from "@/components/NefesLogo";
import { NavItem } from "./components/NavItem";
import { GameNavItem } from "./components/GameNavItem";

import pkg from "@/../package.json";

export function Sidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();
  const { data: games } = useGames();
  const { data: session } = useSession();
  const { openLogin } = useLoginModal();
  const [streakOpen, setStreakOpen] = useState(false);
  const [releaseOpen, setReleaseOpen] = useState(() => getHasNewRelease());
  const playedGameIds = useTodayPlayedGameIds(session?.user?.id);
  const { data: streak } = useUserStreak(session?.user?.id);

  const competitive = games?.filter((g) => g.type === "COMPETITIVE") ?? [];
  const cooperative = games?.filter((g) => g.type === "COOPERATIVE") ?? [];

  const sidebarContent = (
    <Box
      as="aside"
      w="240px"
      h="100vh"
      bg="white"
      borderRightWidth={1}
      borderColor="gray.100"
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
      <Box flex={1} overflowY="auto" minH={0}>
        <VStack mt={4} px={2} gap={2} align="stretch" pb={2}>
          {/* Home */}
          <NavItem
            href="/"
            Icon={Ranking}
            label="Home"
            active={pathname === "/"}
            disabled
            badge="soon"
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
                <Box key={g.id} onClick={onMobileClose}>
                  <GameNavItem
                    game={g}
                    active={pathname === `/games/${g.slug ?? g.id}`}
                    playedToday={
                      session?.user ? playedGameIds.has(g.id) : undefined
                    }
                  />
                </Box>
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
                <Box key={g.id} onClick={onMobileClose}>
                  <GameNavItem
                    game={g}
                    active={pathname === `/games/${g.slug ?? g.id}`}
                    playedToday={
                      session?.user ? playedGameIds.has(g.id) : undefined
                    }
                  />
                </Box>
              ))}
            </>
          )}

          {/* Empty state */}
          {games && games.length === 0 && (
            <Text
              fontSize="sm"
              color="gray.400"
              px={4}
              mt={4}
              textAlign="center"
            >
              Nenhum jogo cadastrado ainda
            </Text>
          )}
        </VStack>
      </Box>
      {/* Botão Novo Jogo fixo na parte inferior */}
      <Box mt="auto" pt={2}>
        {session?.user && (
          <Flex px={2}>
            <Button
              _hover={{ color: "orange.400", bgColor: "orange.400/10" }}
              borderRadius={"lg"}
              title="Dias jogados"
              width={"100%"}
              size={"sm"}
              px={2}
              variant={"ghost"}
              color="brand.solid"
              onClick={() => setStreakOpen(true)}
            >
              Streak de dias jogados:{" "}
              {streak && streak.currentStreak > 0 && (
                <Text>{streak.currentStreak}</Text>
              )}{" "}
              <Fire weight="BoldDuotone" />
            </Button>
          </Flex>
        )}

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

              <IconButton
                size="xs"
                variant="ghost"
                color="gray.400"
                _hover={{ color: "red.500", bgColor: "red.500/10" }}
                onClick={() => signOut()}
                title="Sair"
              >
                <Logout weight="BoldDuotone" />
              </IconButton>
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
          <Text
            fontSize="2xs"
            color="gray.400"
            textAlign="center"
            mt={3}
            cursor="pointer"
            _hover={{ color: "brand.solid" }}
            transition="color 0.15s"
            onClick={() => setReleaseOpen(true)}
          >
            v{pkg.version}
          </Text>
        </Box>
      </Box>

      <StreakModal
        open={streakOpen}
        onClose={() => setStreakOpen(false)}
        streak={streak}
      />
      <ReleaseNotesModal
        open={releaseOpen}
        onClose={() => setReleaseOpen(false)}
      />
    </Box>
  );

  return (
    <>
      {/* Desktop sidebar — fixed */}
      <Box
        display={{ base: "none", md: "block" }}
        position="fixed"
        left={0}
        top={0}
        zIndex={100}
      >
        {sidebarContent}
      </Box>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <Box
          display={{ base: "block", md: "none" }}
          position="fixed"
          inset={0}
          zIndex={200}
        >
          <Box
            position="fixed"
            inset={0}
            bg="blackAlpha.600"
            onClick={onMobileClose}
          />
          <Box
            position="fixed"
            left={0}
            top={0}
            zIndex={201}
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </Box>
        </Box>
      )}
    </>
  );
}
