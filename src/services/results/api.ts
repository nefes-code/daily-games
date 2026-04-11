import type {
  GameResult,
  ResultsFilter,
  SubmitResultInput,
} from "@/services/types";

const BASE = "/api/results";

export async function getResults(
  filters: ResultsFilter = {},
): Promise<GameResult[]> {
  const params = new URLSearchParams();
  if (filters.gameId) params.set("gameId", filters.gameId);
  if (filters.date) params.set("date", filters.date);
  if (filters.userId) params.set("userId", filters.userId);

  const qs = params.toString();
  const res = await fetch(qs ? `${BASE}?${qs}` : BASE);
  if (!res.ok) throw new Error("Falha ao buscar resultados");
  return res.json();
}

export async function submitResult(
  input: SubmitResultInput,
): Promise<GameResult | GameResult[]> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Falha ao cadastrar resultado");
  }
  return res.json();
}

export async function applyBoost(resultId: string): Promise<GameResult> {
  const res = await fetch(`${BASE}/${resultId}/boost`, {
    method: "POST",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Falha ao aplicar impulso");
  }
  return res.json();
}
