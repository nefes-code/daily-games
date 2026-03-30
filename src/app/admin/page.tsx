"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Separator,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useLoginModal } from "@/lib/login-modal-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminGame = {
  id: string;
  name: string;
  slug: string | null;
  active: boolean;
  type: string;
};

type AdminResult = {
  id: string;
  value: number;
  playedAt: string;
  game: { name: string } | null;
  user: { name: string | null; email: string } | null;
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

// ─── Admin Panel ──────────────────────────────────────────────────────────────

function AdminPanel() {
  const [games, setGames] = useState<AdminGame[]>([]);
  const [results, setResults] = useState<AdminResult[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [loadingResults, setLoadingResults] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  async function toggleGame(id: string) {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/games/${id}`, { method: "PATCH" });
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
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette={game.active ? "red" : "green"}
                  loading={togglingId === game.id}
                  onClick={() => toggleGame(game.id)}
                >
                  {game.active ? "Desativar" : "Ativar"}
                </Button>
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
    // Check if admin cookie is valid
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
