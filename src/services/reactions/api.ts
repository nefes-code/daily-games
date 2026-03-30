const BASE = "/api/results";

export async function addReaction(
  resultId: string,
  emoji: string,
): Promise<void> {
  const res = await fetch(`${BASE}/${resultId}/reactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emoji }),
  });
  if (!res.ok) throw new Error("Falha ao salvar reação");
}

export async function removeReaction(resultId: string): Promise<void> {
  const res = await fetch(`${BASE}/${resultId}/reactions`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Falha ao remover reação");
}
