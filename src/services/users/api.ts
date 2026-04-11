import type {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserStreak,
  BoostInfo,
  RescueInfo,
} from "@/services/types";

const BASE = "/api/users";

export async function getUsers(): Promise<User[]> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error("Falha ao buscar usuários");
  return res.json();
}

export async function getUser(id: string): Promise<User> {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error("Falha ao buscar usuário");
  return res.json();
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Falha ao criar usuário");
  return res.json();
}

export async function updateUser(
  id: string,
  input: UpdateUserInput,
): Promise<User> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Falha ao atualizar usuário");
  return res.json();
}

export async function getUserStreak(id: string): Promise<UserStreak> {
  const res = await fetch(`${BASE}/${id}/streak`);
  if (!res.ok) throw new Error("Falha ao buscar streak");
  return res.json();
}

export async function getUserBoostInfo(id: string): Promise<BoostInfo> {
  const res = await fetch(`${BASE}/${id}/boost`);
  if (!res.ok) throw new Error("Falha ao buscar info do impulso");
  return res.json();
}

export async function getUserRescueInfo(id: string): Promise<RescueInfo> {
  const res = await fetch(`${BASE}/${id}/streak/rescue`);
  if (!res.ok) throw new Error("Falha ao verificar resgate");
  return res.json();
}

export async function attemptStreakRescue(
  id: string,
): Promise<{
  success: boolean;
  missedDate: string;
  previousStreak: number;
  rescuedByGame: string;
}> {
  const res = await fetch(`${BASE}/${id}/streak/rescue`, {
    method: "POST",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Falha ao resgatar streak");
  }
  return res.json();
}
