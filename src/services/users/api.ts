import type {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserStreak,
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
