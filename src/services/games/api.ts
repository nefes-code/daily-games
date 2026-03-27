import type { Game, CreateGameInput, UpdateGameInput } from "@/services/types";

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
