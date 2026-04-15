import type {
  Game,
  CreateGameInput,
  UpdateGameInput,
  LeaderboardEntry,
  StatsResponse,
  StatsFilters,
} from "@/services/types";

const BASE = "/api/games";

export async function getGames(): Promise<Game[]> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error("Falha ao buscar jogos");
  return res.json();
}

export async function getGame(id: string): Promise<Game> {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error("Falha ao buscar jogo");
  return res.json();
}

export async function createGame(input: CreateGameInput): Promise<Game> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Falha ao criar jogo");
  return res.json();
}

export async function getLeaderboard(
  slug: string,
): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${BASE}/${slug}/leaderboard`);
  if (!res.ok) throw new Error("Falha ao buscar leaderboard");
  return res.json();
}

export async function updateGame(
  id: string,
  input: UpdateGameInput,
): Promise<Game> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Falha ao atualizar jogo");
  return res.json();
}

export async function getStats(
  slug: string,
  filters: Partial<StatsFilters>,
): Promise<StatsResponse> {
  const params = new URLSearchParams();
  if (filters.days != null) params.set("days", String(filters.days));
  if (filters.metric) params.set("metric", filters.metric);
  if (filters.playerId) params.set("playerId", filters.playerId);
  if (filters.date) params.set("date", filters.date);
  const res = await fetch(`${BASE}/${slug}/stats?${params}`);
  if (!res.ok) throw new Error("Falha ao buscar estatísticas");
  return res.json();
}
