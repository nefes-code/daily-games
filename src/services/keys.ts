import type { ResultsFilter } from "./types";

/**
 * Centralized query key factory — usado por hooks e invalidações.
 * O prefixo de array garante que `invalidateQueries` funcione por namespace.
 *
 * Exemplo:
 *   queryKeys.users.all()       → ['users']
 *   queryKeys.users.detail(id)  → ['users', 'detail', id]
 */
export const queryKeys = {
  users: {
    all: () => ["users"] as const,
    detail: (id: string) => ["users", "detail", id] as const,
    streak: (id: string) => ["users", "streak", id] as const,
    boost: (id: string) => ["users", "boost", id] as const,
    rescue: (id: string) => ["users", "rescue", id] as const,
  },

  games: {
    all: () => ["games"] as const,
    detail: (id: string) => ["games", "detail", id] as const,
    leaderboard: (slug: string) => ["games", "leaderboard", slug] as const,
  },

  results: {
    all: () => ["results"] as const,
    filtered: (filters: ResultsFilter) =>
      ["results", "filtered", filters] as const,
  },
} as const;
