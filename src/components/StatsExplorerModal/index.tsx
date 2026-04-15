"use client";

import { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  Flex,
  HStack,
  Input,
  Portal,
  Select,
  Separator,
  Spinner,
  Square,
  Stack,
  Table,
  Text,
  VStack,
  createListCollection,
  useSelectContext,
} from "@chakra-ui/react";
import { CloseCircle, ChartSquare } from "@solar-icons/react";
import { useStats } from "@/services/games/hooks";
import type { Game, StatsFilters } from "@/services/types";
import { formatValue } from "@/components/GamePage/helpers";
import { getInitials, avatarColor } from "@/components/GamePage/helpers";

const PERIOD_OPTIONS: { label: string; value: StatsFilters["days"] }[] = [
  { label: "7d", value: 7 },
  { label: "10d", value: 10 },
  { label: "20d", value: 20 },
  { label: "30d", value: 30 },
  { label: "60d", value: 60 },
  { label: "Tudo", value: "all" },
];

const METRIC_OPTIONS: { label: string; value: StatsFilters["metric"] }[] = [
  { label: "Média", value: "avg" },
  { label: "Melhor", value: "best" },
  { label: "Pior", value: "worst" },
  { label: "Dias", value: "total_days" },
];

type PlayerItem = { id: string; name: string; image?: string | null };

function PlayerSelectValue() {
  const select = useSelectContext();
  const selected = select.selectedItems as PlayerItem[];
  if (!selected[0]?.id) {
    return (
      <Select.ValueText
        placeholder="Todos os jogadores"
        fontSize="xs"
        fontWeight="700"
      />
    );
  }
  const p = selected[0];
  return (
    <Select.ValueText placeholder="Todos os jogadores">
      <HStack gap={1.5}>
        <Avatar.Root bg={avatarColor(p.name)} shape="full" w={4} h={4}>
          {p.image && <Avatar.Image src={p.image} />}
          <Avatar.Fallback fontSize="3xs" fontWeight="700">
            {getInitials(p.name)}
          </Avatar.Fallback>
        </Avatar.Root>
        <Text fontSize="xs" fontWeight="700">
          {p.name?.split(" ")[0]}
        </Text>
      </HStack>
    </Select.ValueText>
  );
}

export function StatsExplorerModal({
  open,
  onClose,
  game,
}: {
  open: boolean;
  onClose: () => void;
  game: Game;
}) {
  const [days, setDays] = useState<StatsFilters["days"]>(30);
  const [metric, setMetric] = useState<StatsFilters["metric"]>("avg");
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);

  const { data, isLoading } = useStats(game.slug ?? game.id, {
    days,
    metric,
    ...(date ? { date } : {}),
    ...(playerId ? { playerId } : {}),
  });

  const metricLabel =
    METRIC_OPTIONS.find((m) => m.value === metric)?.label ?? "Valor";

  function fmtValue(value: number) {
    if (metric === "total_days") return String(value);
    return formatValue(value, game);
  }

  const hasPlayerFilter = playerId !== null;
  const hasDateFilter = date !== null;

  const playerCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { id: "", name: "Todos os jogadores", image: null },
          ...(data?.players ?? []),
        ],
        itemToValue: (p) => p.id,
        itemToString: (p) => p.name,
      }),
    [data?.players],
  );

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(d) => !d.open && onClose()}
      scrollBehavior="inside"
      placement="center"
      size="xl"
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="white"
            rounded="2xl"
            mx={4}
            w="full"
            boxShadow="xl"
          >
            <Dialog.CloseTrigger color="gray.300" cursor="pointer">
              <CloseCircle size={24} weight="BoldDuotone" />
            </Dialog.CloseTrigger>

            <Dialog.Body px={{ base: 4, md: 6 }} pt={6} pb={6}>
              <VStack alignItems="start" gap={6}>
                {/* Header */}
                <HStack gap={3} w="fit-content">
                  <Square
                    borderRadius="lg"
                    bgColor="brand.solid"
                    size={12}
                    color="white"
                  >
                    <ChartSquare size={32} weight="BoldDuotone" />
                  </Square>
                  <Stack gap={1}>
                    <Text fontSize="xl" fontWeight="800" color="gray.800">
                      {game.name} - Estatísticas
                    </Text>
                    <Text fontSize="sm" color="gray.500" fontWeight="600">
                      Filtre e compare métricas entre jogadores
                    </Text>
                  </Stack>
                </HStack>

                <Separator width="100%" borderColor="gray.100" />

                {/* Filters row */}
                <Stack gap={4} w="full" align="start" flexWrap="wrap">
                  <HStack align={"center"} gap={6}>
                    {/* Period */}
                    <Box>
                      <Text
                        fontSize="xs"
                        fontWeight="700"
                        color="gray.400"
                        mb={1.5}
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                      >
                        Período
                      </Text>
                      <Flex gap={1} flexWrap="wrap">
                        {PERIOD_OPTIONS.map((opt) => (
                          <Button
                            key={String(opt.value)}
                            size="xs"
                            rounded="full"
                            fontWeight="700"
                            fontSize="xs"
                            bg={days === opt.value ? "brand.solid" : "gray.100"}
                            color={days === opt.value ? "white" : "gray.600"}
                            _hover={{
                              bg:
                                days === opt.value
                                  ? "brand.emphasized"
                                  : "gray.200",
                            }}
                            onClick={() => setDays(opt.value)}
                          >
                            {opt.label}
                          </Button>
                        ))}
                      </Flex>
                    </Box>
                    <Separator orientation={"vertical"} height={8} />
                    <Box>
                      <Text
                        fontSize="xs"
                        fontWeight="700"
                        color="gray.400"
                        mb={1.5}
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                      >
                        Métrica
                      </Text>
                      <Flex gap={1} flexWrap="wrap">
                        {METRIC_OPTIONS.map((opt) => (
                          <Button
                            key={opt.value}
                            size="xs"
                            rounded="full"
                            fontWeight="700"
                            fontSize="xs"
                            bg={
                              metric === opt.value ? "brand.solid" : "gray.100"
                            }
                            color={metric === opt.value ? "white" : "gray.600"}
                            _hover={{
                              bg:
                                metric === opt.value
                                  ? "brand.emphasized"
                                  : "gray.200",
                            }}
                            onClick={() => setMetric(opt.value)}
                          >
                            {opt.label}
                          </Button>
                        ))}
                      </Flex>
                    </Box>
                  </HStack>
                  <HStack alignItems={"center"} gap={6}>
                    <Box>
                      <Text
                        fontSize="xs"
                        fontWeight="700"
                        color="gray.400"
                        mb={1.5}
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                      >
                        Apenas dias de...
                      </Text>
                      <Select.Root
                        collection={playerCollection}
                        size="sm"
                        w={52}
                        positioning={{
                          strategy: "fixed",
                          hideWhenDetached: true,
                        }}
                        value={[playerId ?? ""]}
                        onValueChange={(d) => setPlayerId(d.value[0] || null)}
                      >
                        <Select.Control>
                          <Select.Trigger
                            rounded="xl"
                            fontWeight="700"
                            fontSize="xs"
                            borderColor={
                              hasPlayerFilter ? "purple.300" : "gray.200"
                            }
                            bg={hasPlayerFilter ? "purple.50" : "white"}
                          >
                            <PlayerSelectValue />
                          </Select.Trigger>
                          <Select.IndicatorGroup>
                            <Select.Indicator />
                          </Select.IndicatorGroup>
                        </Select.Control>
                        <Select.Positioner>
                          <Select.Content borderRadius={"xl"}>
                            {playerCollection.items.map((p) => (
                              <Select.Item
                                borderRadius={"xl"}
                                key={p.id}
                                item={p}
                              >
                                <HStack gap={2}>
                                  {p.id ? (
                                    <Avatar.Root
                                      bg={avatarColor(p.name)}
                                      shape="full"
                                      w={5}
                                      h={5}
                                    >
                                      {p.image && (
                                        <Avatar.Image src={p.image} />
                                      )}
                                      <Avatar.Fallback
                                        fontSize="3xs"
                                        fontWeight="700"
                                      >
                                        {getInitials(p.name)}
                                      </Avatar.Fallback>
                                    </Avatar.Root>
                                  ) : null}
                                  <Select.ItemText
                                    fontSize="xs"
                                    fontWeight="700"
                                  >
                                    {p.name}
                                  </Select.ItemText>
                                </HStack>
                                <Select.ItemIndicator />
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Select.Root>
                    </Box>
                    <Separator orientation={"vertical"} height={8} />
                    {/* Date filter */}
                    <Box>
                      <Text
                        fontSize="xs"
                        fontWeight="700"
                        color="gray.400"
                        mb={1.5}
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                      >
                        Data específica
                      </Text>
                      <HStack gap={1}>
                        <Input
                          type="date"
                          size="sm"
                          rounded="xl"
                          maxW={36}
                          borderColor={
                            hasDateFilter ? "orange.300" : "gray.200"
                          }
                          bg={hasDateFilter ? "orange.50" : "white"}
                          value={date ?? ""}
                          onChange={(e) => setDate(e.target.value || null)}
                        />
                        {hasDateFilter && (
                          <Button
                            size="xs"
                            rounded="full"
                            fontWeight="700"
                            fontSize="xs"
                            bg="orange.100"
                            color="orange.600"
                            _hover={{ bg: "orange.200" }}
                            onClick={() => setDate(null)}
                          >
                            ✕
                          </Button>
                        )}
                      </HStack>
                    </Box>
                  </HStack>
                </Stack>

                {/* Results Table */}
                {isLoading ? (
                  <Flex justify="center" py={8} w="full">
                    <Spinner size="md" color="brand.solid" />
                  </Flex>
                ) : !data || data.rows.length === 0 ? (
                  <Text
                    fontSize="xs"
                    color="gray.400"
                    fontWeight="600"
                    py={6}
                    textAlign="center"
                    w="full"
                  >
                    Nenhum resultado encontrado para esses filtros
                  </Text>
                ) : (
                  <Table.Root
                    size="md"
                    variant="line"
                    w="full"
                    borderRadius={"xl"}
                    overflow={"hidden"}
                  >
                    <Table.Header>
                      <Table.Row bg="gray.50">
                        <Table.ColumnHeader
                          fontSize="xs"
                          fontWeight="700"
                          color="gray.400"
                          textTransform="uppercase"
                          w={8}
                          px={2}
                        >
                          #
                        </Table.ColumnHeader>
                        <Table.ColumnHeader
                          fontSize="xs"
                          fontWeight="700"
                          color="gray.400"
                          textTransform="uppercase"
                          px={2}
                        >
                          Jogador
                        </Table.ColumnHeader>
                        <Table.ColumnHeader
                          fontSize="xs"
                          fontWeight="700"
                          color="gray.400"
                          textTransform="uppercase"
                          textAlign="right"
                          px={2}
                        >
                          {hasDateFilter ? "Resultado" : metricLabel}
                        </Table.ColumnHeader>
                        {!hasDateFilter && (
                          <Table.ColumnHeader
                            fontSize="xs"
                            fontWeight="700"
                            color="gray.400"
                            textTransform="uppercase"
                            textAlign="right"
                            px={2}
                          >
                            Dias
                          </Table.ColumnHeader>
                        )}
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {data.rows.map((row, i) => {
                        const isFirst = i === 0;
                        return (
                          <Table.Row height={10} key={row.userId}>
                            <Table.Cell px={2} py={1.5}>
                              <Text
                                fontSize="xs"
                                fontWeight="800"
                                fontFamily="mono"
                                color={isFirst ? "brand.solid" : "gray.400"}
                              >
                                {row.rank}
                              </Text>
                            </Table.Cell>
                            <Table.Cell px={2} py={1.5}>
                              <HStack gap={1.5}>
                                <Avatar.Root
                                  bg={avatarColor(row.name)}
                                  shape="full"
                                  w={6}
                                  h={6}
                                >
                                  {row.image && (
                                    <Avatar.Image src={row.image} />
                                  )}
                                  <Avatar.Fallback
                                    fontSize="3xs"
                                    fontWeight="700"
                                  >
                                    {getInitials(row.name)}
                                  </Avatar.Fallback>
                                </Avatar.Root>
                                <Text
                                  fontSize="xs"
                                  fontWeight="700"
                                  color="gray.800"
                                  lineClamp={1}
                                >
                                  {row.name}
                                </Text>
                              </HStack>
                            </Table.Cell>
                            <Table.Cell px={2} py={1.5} textAlign="right">
                              <Text
                                fontSize="xs"
                                fontWeight="800"
                                fontFamily="mono"
                                letterSpacing="-0.02em"
                                color={isFirst ? "brand.solid" : "gray.700"}
                              >
                                {fmtValue(row.value)}
                              </Text>
                            </Table.Cell>
                            {!hasDateFilter && (
                              <Table.Cell px={2} py={1.5} textAlign="right">
                                <Text
                                  fontSize="xs"
                                  fontWeight="600"
                                  color="gray.400"
                                >
                                  {row.daysPlayed}/{data.totalDays}
                                </Text>
                              </Table.Cell>
                            )}
                          </Table.Row>
                        );
                      })}
                    </Table.Body>
                  </Table.Root>
                )}
                {data && data.rows.length > 0 && (
                  <Text
                    fontSize="2xs"
                    color="gray.400"
                    fontWeight="500"
                    lineHeight="1.5"
                  >
                    As métricas consideram apenas os dias em que cada jogador
                    efetivamente registrou resultado — dias sem participação não
                    são contabilizados. A coluna{" "}
                    <Text as="span" fontWeight="700">
                      Dias
                    </Text>{" "}
                    mostra quantos dias o jogador participou em relação ao total
                    de dias com algum resultado no período.
                  </Text>
                )}
              </VStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
