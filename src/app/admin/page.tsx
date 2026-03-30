"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Badge,
  Box,
  Button,
  Dialog,
  Field,
  Flex,
  HStack,
  Input,
  NativeSelect,
  Portal,
  Separator,
  Spinner,
  Switch,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useLoginModal } from "@/lib/login-modal-context";
import { GAME_ICON_OPTIONS, getGameIcon } from "@/utils/game-icon";
import { Gamepad } from "@solar-icons/react";
import type { GameIcon, GameType, ResultType } from "@/services/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminGame = {
  id: string;
  name: string;
  slug: string | null;
  url: string;
  active: boolean;
  type: GameType;
  resultType: ResultType;
  resultSuffix: string | null;
  resultMax: number | null;
  lowerIsBetter: boolean;
  icon: GameIcon | null;
};

type AdminResult = {
  id: string;
  value: number;
  playedAt: string;
  game: { name: string } | null;
  user: { name: string | null; email: string } | null;
};

type EditForm = {
  name: string;
  url: string;
  slug: string;
  type: GameType;
  resultType: ResultType;
  resultSuffix: string;
  resultMax: string;
  lowerIsBetter: boolean;
  icon: GameIcon | undefined;
};

// ─── PIN Input ────────────────────────────────────────────────────────────────

function PinScreen({ onSuccess }: { onSuccess: () => void }) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error ?? "PIN inválido");
        setPin("");
      }
    } catch {
      setError("Erro ao verificar PIN");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Flex minH="60vh" align="center" justify="center">
      <Box
        as="form"
        onSubmit={handleSubmit}
        bg="white"
        p={8}
        borderRadius="xl"
        borderWidth={1}
        borderColor="gray.100"
        w="300px"
      >
        <VStack gap={4}>
          <Text fontWeight="800" fontSize="xl">
            Área Admin
          </Text>
          <Text fontSize="sm" color="gray.500" textAlign="center">
            Digite o PIN para acessar
          </Text>
          <Input
            type="password"
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={10}
            textAlign="center"
            letterSpacing="0.4em"
            fontSize="xl"
            autoFocus
          />
          {error && (
            <Text color="red.500" fontSize="sm">
              {error}
            </Text>
          )}
          <Button
            type="submit"
            colorPalette="yellow"
            w="full"
            loading={loading}
            disabled={!pin}
          >
            Entrar
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}

// ─── Edit Game Modal ──────────────────────────────────────────────────────────

function EditGameModal({
  game,
  onClose,
  onSaved,
}: {
  game: AdminGame;
  onClose: () => void;
  onSaved: (updated: AdminGame) => void;
}) {
  const [form, setForm] = useState<EditForm>({
    name: game.name,
    url: game.url,
    slug: game.slug ?? "",
    type: game.type,
    resultType: game.resultType,
    resultSuffix: game.resultSuffix ?? "",
    resultMax: game.resultMax !== null ? String(game.resultMax) : "",
    lowerIsBetter: game.lowerIsBetter,
    icon: game.icon ?? undefined,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof EditForm>(key: K, value: EditForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!form.name.trim() || !form.url.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/games/${game.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          url: form.url.trim(),
          slug: form.slug.trim() || null,
          type: form.type,
          resultType: form.resultType,
          resultSuffix: form.resultSuffix.trim() || null,
          resultMax: form.resultMax ? Number(form.resultMax) : null,
          lowerIsBetter: form.lowerIsBetter,
          icon: form.icon ?? null,
        }),
      });
      if (res.ok) {
        onSaved(await res.json());
        onClose();
      } else {
        const data = await res.json();
        setError(data.error ?? "Erro ao salvar");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog.Root
      open
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="white"
            rounded="2xl"
            mx={4}
            maxW="500px"
            w="full"
            boxShadow="xl"
          >
            <Dialog.Header
              borderBottomWidth={1}
              borderColor="gray.100"
              px={6}
              py={4}
            >
              <Dialog.Title fontSize="lg" fontWeight="800">
                <HStack>
                  <Gamepad size={22} weight="BoldDuotone" />
                  <Text>Editar jogo</Text>
                </HStack>
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body px={6} py={5}>
              <VStack gap={4} align="stretch">
                {/* Nome */}
                <Field.Root required>
                  <Field.Label fontWeight="700" fontSize="sm">
                    Nome
                  </Field.Label>
                  <Input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    rounded="lg"
                  />
                </Field.Root>

                {/* URL */}
                <Field.Root required>
                  <Field.Label fontWeight="700" fontSize="sm">
                    Link
                  </Field.Label>
                  <Input
                    value={form.url}
                    onChange={(e) => set("url", e.target.value)}
                    rounded="lg"
                  />
                </Field.Root>

                {/* Slug */}
                <Field.Root>
                  <Field.Label fontWeight="700" fontSize="sm">
                    Slug
                  </Field.Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => set("slug", e.target.value)}
                    rounded="lg"
                    placeholder="gerado automaticamente"
                  />
                </Field.Root>

                {/* Ícone */}
                <Field.Root>
                  <Field.Label fontWeight="700" fontSize="sm">
                    Ícone
                  </Field.Label>
                  <Flex gap={2} flexWrap="wrap">
                    {GAME_ICON_OPTIONS.map(({ value, label }) => {
                      const Icon = getGameIcon(value);
                      const selected = form.icon === value;
                      return (
                        <Box
                          key={value}
                          as="button"
                          onClick={() =>
                            set("icon", selected ? undefined : value)
                          }
                          rounded="lg"
                          borderWidth={1}
                          borderColor={selected ? "brand.solid" : "gray.100"}
                          bg={selected ? "brand.subtle" : "white"}
                          color={selected ? "brand.solid" : "gray.500"}
                          p={2}
                          display="flex"
                          flexDir="column"
                          alignItems="center"
                          gap={1}
                          cursor="pointer"
                          _hover={{
                            borderColor: "brand.solid",
                            color: "brand.solid",
                          }}
                          title={label}
                        >
                          <Icon size={20} weight="BoldDuotone" />
                          <Text fontSize="9px" fontWeight="600" lineHeight="1">
                            {label}
                          </Text>
                        </Box>
                      );
                    })}
                  </Flex>
                </Field.Root>

                {/* Tipo + Resultado */}
                <Flex gap={4}>
                  <Field.Root flex={1}>
                    <Field.Label fontWeight="700" fontSize="sm">
                      Tipo
                    </Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        value={form.type}
                        onChange={(e) =>
                          set("type", e.target.value as GameType)
                        }
                        rounded="lg"
                      >
                        <option value="COMPETITIVE">Competitivo</option>
                        <option value="COOPERATIVE">Cooperativo</option>
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Field.Root>
                  <Field.Root flex={1}>
                    <Field.Label fontWeight="700" fontSize="sm">
                      Resultado
                    </Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        value={form.resultType}
                        onChange={(e) =>
                          set("resultType", e.target.value as ResultType)
                        }
                        rounded="lg"
                      >
                        <option value="SCORE">Pontuação</option>
                        <option value="TIME">Tempo</option>
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Field.Root>
                </Flex>

                {/* Sufixo + Máximo */}
                <Flex gap={4}>
                  <Field.Root flex={1}>
                    <Field.Label fontWeight="700" fontSize="sm">
                      Sufixo
                    </Field.Label>
                    <Input
                      value={form.resultSuffix}
                      onChange={(e) => set("resultSuffix", e.target.value)}
                      placeholder="pts"
                      rounded="lg"
                    />
                  </Field.Root>
                  <Field.Root flex={1}>
                    <Field.Label fontWeight="700" fontSize="sm">
                      Valor máximo
                    </Field.Label>
                    <Input
                      type="number"
                      value={form.resultMax}
                      onChange={(e) => set("resultMax", e.target.value)}
                      placeholder="sem limite"
                      rounded="lg"
                    />
                  </Field.Root>
                </Flex>

                {/* Menor é melhor */}
                <Field.Root>
                  <HStack justify="space-between">
                    <Field.Label fontWeight="700" fontSize="sm" mb={0}>
                      Menor é melhor
                    </Field.Label>
                    <Switch.Root
                      checked={form.lowerIsBetter}
                      onCheckedChange={(e) => set("lowerIsBetter", e.checked)}
                      colorPalette="yellow"
                    >
                      <Switch.HiddenInput />
                      <Switch.Control>
                        <Switch.Thumb />
                      </Switch.Control>
                    </Switch.Root>
                  </HStack>
                </Field.Root>

                {error && (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                )}
              </VStack>
            </Dialog.Body>

            <Dialog.Footer
              borderTopWidth={1}
              borderColor="gray.100"
              px={6}
              py={4}
            >
              <HStack justify="flex-end" gap={3}>
                <Button variant="outline" onClick={onClose} disabled={saving}>
                  Cancelar
                </Button>
                <Button
                  colorPalette="yellow"
                  loading={saving}
                  onClick={handleSave}
                  disabled={!form.name.trim() || !form.url.trim()}
                >
                  Salvar
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

// ─── Admin Panel ──────────────────────────────────────────────────────────────

function AdminPanel() {
  const [games, setGames] = useState<AdminGame[]>([]);
  const [results, setResults] = useState<AdminResult[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [loadingResults, setLoadingResults] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingGame, setEditingGame] = useState<AdminGame | null>(null);

  const fetchGames = useCallback(async () => {
    setLoadingGames(true);
    try {
      const res = await fetch("/api/admin/games");
      if (res.ok) setGames(await res.json());
    } finally {
      setLoadingGames(false);
    }
  }, []);

  const fetchResults = useCallback(async () => {
    setLoadingResults(true);
    try {
      const res = await fetch("/api/admin/results");
      if (res.ok) setResults(await res.json());
    } finally {
      setLoadingResults(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
    fetchResults();
  }, [fetchGames, fetchResults]);

  async function toggleGame(id: string, currentActive: boolean) {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/games/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });
      if (res.ok) {
        const updated: AdminGame = await res.json();
        setGames((prev) =>
          prev.map((g) => (g.id === id ? { ...g, active: updated.active } : g)),
        );
      }
    } finally {
      setTogglingId(null);
    }
  }

  async function deleteResult(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/results/${id}`, { method: "DELETE" });
      if (res.ok) {
        setResults((prev) => prev.filter((r) => r.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR");
  }

  return (
    <VStack align="stretch" gap={8}>
      <Text fontSize="2xl" fontWeight="800">
        Painel Admin
      </Text>

      {/* ─── Jogos ───────────────────────────────────────────────── */}
      <Box>
        <Text fontSize="lg" fontWeight="700" mb={3}>
          Jogos
        </Text>
        {loadingGames ? (
          <Spinner />
        ) : (
          <VStack align="stretch" gap={2}>
            {games.map((game) => (
              <HStack
                key={game.id}
                bg="white"
                px={4}
                py={3}
                borderRadius="lg"
                borderWidth={1}
                borderColor="gray.100"
                justify="space-between"
              >
                <HStack gap={3}>
                  <Text fontWeight="600">{game.name}</Text>
                  <Badge
                    colorPalette={game.active ? "green" : "gray"}
                    size="sm"
                  >
                    {game.active ? "Ativo" : "Inativo"}
                  </Badge>
                </HStack>
                <HStack gap={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingGame(game)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    colorPalette={game.active ? "red" : "green"}
                    loading={togglingId === game.id}
                    onClick={() => toggleGame(game.id, game.active)}
                  >
                    {game.active ? "Desativar" : "Ativar"}
                  </Button>
                </HStack>
              </HStack>
            ))}
          </VStack>
        )}
      </Box>

      <Separator />

      {/* ─── Resultados ──────────────────────────────────────────── */}
      <Box>
        <Text fontSize="lg" fontWeight="700" mb={3}>
          Resultados recentes
        </Text>
        {loadingResults ? (
          <Spinner />
        ) : results.length === 0 ? (
          <Text color="gray.400" fontSize="sm">
            Nenhum resultado registrado
          </Text>
        ) : (
          <VStack align="stretch" gap={2}>
            {results.map((result) => (
              <HStack
                key={result.id}
                bg="white"
                px={4}
                py={3}
                borderRadius="lg"
                borderWidth={1}
                borderColor="gray.100"
                justify="space-between"
                flexWrap="wrap"
                gap={2}
              >
                <VStack align="start" gap={0}>
                  <HStack gap={2}>
                    <Text fontWeight="600" fontSize="sm">
                      {result.game?.name ?? "—"}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {formatDate(result.playedAt)}
                    </Text>
                  </HStack>
                  <Text fontSize="xs" color="gray.400">
                    {result.user?.name ??
                      result.user?.email ??
                      "Usuário desconhecido"}
                    {" · "}valor: {result.value}
                  </Text>
                </VStack>
                <Button
                  size="xs"
                  variant="outline"
                  colorPalette="red"
                  loading={deletingId === result.id}
                  onClick={() => deleteResult(result.id)}
                >
                  Excluir
                </Button>
              </HStack>
            ))}
          </VStack>
        )}
      </Box>

      {/* ─── Modal de edição ─────────────────────────────────────── */}
      {editingGame && (
        <EditGameModal
          game={editingGame}
          onClose={() => setEditingGame(null)}
          onSaved={(updated) => {
            setGames((prev) =>
              prev.map((g) =>
                g.id === updated.id ? (updated as AdminGame) : g,
              ),
            );
          }}
        />
      )}
    </VStack>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { data: session, status } = useSession();
  const { openLogin } = useLoginModal();
  const [authStatus, setAuthStatus] = useState<"loading" | "pin" | "admin">(
    "loading",
  );

  useEffect(() => {
    if (status === "loading" || !session?.user) return;
    fetch("/api/admin/auth")
      .then((r) => {
        setAuthStatus(r.ok ? "admin" : "pin");
      })
      .catch(() => setAuthStatus("pin"));
  }, [session, status]);

  if (status === "loading") {
    return (
      <Flex justify="center" py={20}>
        <Spinner size="xl" color="brand.solid" />
      </Flex>
    );
  }

  if (!session?.user) {
    return (
      <Flex minH="60vh" align="center" justify="center">
        <VStack gap={4}>
          <Text fontSize="lg" fontWeight="700" color="gray.500">
            Faça login para acessar o admin
          </Text>
          <Button colorPalette="yellow" onClick={openLogin}>
            Entrar com Google
          </Button>
        </VStack>
      </Flex>
    );
  }

  if (authStatus === "loading") {
    return (
      <Flex justify="center" py={20}>
        <Spinner size="xl" color="brand.solid" />
      </Flex>
    );
  }

  if (authStatus === "pin") {
    return <PinScreen onSuccess={() => setAuthStatus("admin")} />;
  }

  return <AdminPanel />;
}
