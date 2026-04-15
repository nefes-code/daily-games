"use client";

import { Avatar, Box, Center, Flex, HStack, Text } from "@chakra-ui/react";
import { getInitials, avatarColor } from "../../helpers";
import { Tooltip } from "@/components/Tooltip";
import { NefesLogo } from "@/components/NefesLogo";

const RANK_GRADIENT = [
  "linear-gradient(135deg, #ffffff 0%, #fef9c3 20%, #fde68a 45%, #d9f99d 100%)",
  "linear-gradient(135deg, #ffffff 0%, #f1f5f9 0%, #e2e8f0 45%, #ddd6fe 100%)",
  "linear-gradient(135deg, #ffffff 0%, #ffedd5 0%, #fed7aa 45%, #fef9c3 100%)",
];
const RANK_SUBTITLE = ["#ffd427", "#9881ff", "#ffad4f"];
const RANK_LABEL = ["1º", "2º", "3º"];

export function PodiumCard({
  rank,
  name,
  value,
  image,
  daysPlayed,
  totalDays,
  bestResult,
  streak,
  empty,
  wide,
}: {
  rank: number;
  name?: string;
  value?: string;
  image?: string | null;
  daysPlayed?: number;
  totalDays?: number;
  streak?: number;
  bestResult?: string;
  empty?: boolean;
  wide?: boolean;
}) {
  const gradient = RANK_GRADIENT[rank - 1];
  const subtitleColor = RANK_SUBTITLE[rank - 1];
  const label = RANK_LABEL[rank - 1];

  if (wide) {
    return (
      <Box
        bg="white"
        rounded="2xl"
        overflow="hidden"
        borderWidth={4}
        shadow="xl"
        borderColor="white"
      >
        <Flex flexDir={{ base: "column", md: "row" }}>
          {/* Gradient sidebar */}
          <Box
            style={{ background: RANK_GRADIENT[0] }}
            position="relative"
            minW={{ base: "auto", md: 48 }}
            minH={{ base: 24, md: "auto" }}
            display="flex"
            alignItems="center"
            justifyContent="center"
            overflow={"hidden"}
            p={{ base: 4, md: 8 }}
          >
            <Text
              position="absolute"
              top={2}
              fontSize="7xl"
              fontWeight="900"
              lineHeight="1"
              fontFamily="mono"
              userSelect="none"
              pointerEvents="none"
              style={{ color: "rgba(0,0,0,0.08)" }}
            >
              NeFEs
            </Text>
            <Center
              bg={"brand.solid"}
              borderRadius={"full"}
              w={20}
              h={20}
              borderWidth={4}
              zIndex={2}
              borderColor="white"
              shadow={"xl"}
              color={"white"}
            >
              <NefesLogo size={50} />
            </Center>
          </Box>

          {/* Content */}
          <Flex
            flex={1}
            px={{ base: 4, md: 8 }}
            py={{ base: 4, md: 6 }}
            align="center"
            gap={{ base: 4, md: 10 }}
            flexWrap="wrap"
          >
            <Box flex={1} minW={0}>
              <Text
                fontSize="2xl"
                fontWeight="900"
                color="gray.900"
                letterSpacing="-0.03em"
                lineHeight="1"
              >
                NeFEs
              </Text>
              <Text fontSize="sm" color="gray.400" fontWeight="500" mt={1}>
                Resultado do time
              </Text>
            </Box>

            <Flex gap={{ base: 4, md: 8 }} flexShrink={0}>
              {daysPlayed != null && (
                <Box textAlign="center">
                  <Text
                    fontSize="lg"
                    fontWeight="900"
                    color="gray.900"
                    fontFamily="mono"
                    letterSpacing="-0.04em"
                  >
                    {totalDays != null && totalDays > 0
                      ? `${daysPlayed}/${totalDays}`
                      : daysPlayed}
                  </Text>
                  <Text fontSize="xs" color="gray.400" fontWeight="500">
                    Dias jogados
                  </Text>
                </Box>
              )}
              {bestResult && (
                <Box textAlign="center">
                  <Text
                    fontSize="lg"
                    fontWeight="900"
                    color="gray.900"
                    fontFamily="mono"
                    letterSpacing="-0.04em"
                  >
                    {bestResult}
                  </Text>
                  <Text fontSize="xs" color="gray.400" fontWeight="500">
                    Melhor resultado
                  </Text>
                </Box>
              )}
              {value && (
                <Box textAlign="center">
                  <Text
                    fontSize="lg"
                    fontWeight="900"
                    color="brand.fg"
                    fontFamily="mono"
                    letterSpacing="-0.04em"
                  >
                    {value}
                  </Text>
                  <Text fontSize="xs" color="gray.400" fontWeight="500">
                    Média
                  </Text>
                </Box>
              )}
            </Flex>
          </Flex>
        </Flex>
      </Box>
    );
  }

  if (empty) {
    return (
      <Box
        bg="white"
        rounded="2xl"
        overflow="visible"
        borderWidth={4}
        shadow="md"
        borderColor="white"
        position="relative"
        opacity={0.55}
      >
        <Box
          style={{ background: gradient }}
          position="relative"
          p={4}
          pb={6}
          height={24}
          roundedTop="xl"
        >
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

          <Box
            position="absolute"
            bottom={0}
            left={4}
            transform="translateY(50%)"
            zIndex={1}
          >
            <Flex
              w={16}
              h={16}
              rounded="full"
              borderWidth={3}
              borderColor="white"
              borderStyle="dashed"
              bg="gray.100"
              align="center"
              justify="center"
              style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}
            >
              <Text fontSize="2xl" color="gray.300" fontWeight="700">
                ?
              </Text>
            </Flex>
          </Box>
        </Box>

        <Box px={4} pb={4} pt={12}>
          <Text fontSize="sm" fontWeight="600" color="gray.400" lineClamp={2}>
            O {label} lugar aparecerá aqui
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      bg="white"
      rounded="2xl"
      overflow="visible"
      borderWidth={4}
      shadow="xl"
      borderColor="white"
      position="relative"
    >
      {/* Gradient header — rounded top to compensate overflow:visible */}
      <Box
        style={{ background: gradient }}
        position="relative"
        p={4}
        pb={6}
        height={24}
        roundedTop="xl"
      >
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

        {/* Avatar — posicionado na borda inferior do header, sobrepondo a área branca */}
        <Box
          position="absolute"
          bottom={0}
          left={4}
          transform="translateY(50%)"
          zIndex={1}
        >
          <Avatar.Root
            bg={avatarColor(name ?? "")}
            shape="full"
            w={16}
            h={16}
            borderWidth={3}
            borderColor="white"
            style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.18)" }}
          >
            {image && <Avatar.Image src={image} />}
            <Avatar.Fallback>{getInitials(name ?? "")}</Avatar.Fallback>
          </Avatar.Root>
        </Box>
        <Flex px={4}>
          <Tooltip openDelay={0} closeDelay={300} showArrow content="Média">
            <Box
              color="white"
              px={3}
              py={1}
              bgColor={"black"}
              position={"absolute"}
              bottom={-3}
              right={2}
              rounded="full"
              fontSize="xs"
              fontWeight="800"
              fontFamily="mono"
              letterSpacing="0.02em"
            >
              {value}
            </Box>
          </Tooltip>
        </Flex>
      </Box>

      {/* Content — pt para o texto não sobrepor o avatar */}
      <Box px={4} pb={4} pt={12}>
        <Text
          fontSize={{ base: "sm", md: "xl" }}
          fontWeight="800"
          color="gray.900"
          lineClamp={1}
          letterSpacing="-0.01em"
        >
          {name}
        </Text>
        <HStack gap={2} mt={0.5}>
          <Text
            fontSize={{ base: "xs", md: "md" }}
            fontWeight="600"
            style={{ color: subtitleColor }}
          >
            {label} lugar
          </Text>
          {streak != null && streak > 0 && (
            <Tooltip
              openDelay={0}
              closeDelay={200}
              showArrow
              content={`${streak} dias seguidos`}
            >
              <HStack
                gap={0.5}
                px={1.5}
                py={0.5}
                bg="orange.50"
                rounded="full"
                cursor="default"
              >
                <Text fontSize="xs" lineHeight="1">
                  🔥
                </Text>
                <Text
                  fontSize="xs"
                  fontWeight="800"
                  color="orange.500"
                  lineHeight="1"
                >
                  {streak}
                </Text>
              </HStack>
            </Tooltip>
          )}
        </HStack>

        {(daysPlayed != null || bestResult != null) && (
          <Flex gap={4} mt={2}>
            {daysPlayed != null && (
              <Box>
                <Text fontSize="xs" color="gray.400" fontWeight="500">
                  Dias
                </Text>
                <Text fontSize="sm" fontWeight="700" color="gray.700">
                  {totalDays != null && totalDays > 0
                    ? `${daysPlayed}/${totalDays}`
                    : daysPlayed}
                </Text>
              </Box>
            )}
            {bestResult != null && (
              <Box>
                <Text fontSize="xs" color="gray.400" fontWeight="500">
                  Melhor
                </Text>
                <Text fontSize="sm" fontWeight="700" color="gray.700">
                  {bestResult}
                </Text>
              </Box>
            )}
          </Flex>
        )}
      </Box>
    </Box>
  );
}
