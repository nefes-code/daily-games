import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/keys";
import type { StatsFilters, UpdateGameInput } from "@/services/types";
import {
  createGame,
  getGame,
  getGames,
  getLeaderboard,
  getStats,
  updateGame,
} from "./api";

export function useGames() {
  return useQuery({
    queryKey: queryKeys.games.all(),
    queryFn: getGames,
  });
}

export function useGame(id: string) {
  return useQuery({
    queryKey: queryKeys.games.detail(id),
    queryFn: () => getGame(id),
    enabled: !!id,
  });
}

export function useLeaderboard(slug: string) {
  return useQuery({
    queryKey: queryKeys.games.leaderboard(slug),
    queryFn: () => getLeaderboard(slug),
    enabled: !!slug,
  });
}

export function useStats(slug: string, filters: Partial<StatsFilters>) {
  return useQuery({
    queryKey: queryKeys.games.stats(slug, filters as Record<string, unknown>),
    queryFn: () => getStats(slug, filters),
    enabled: !!slug,
  });
}

export function useCreateGame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createGame,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.games.all() });
    },
  });
}

export function useUpdateGame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGameInput }) =>
      updateGame(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.games.all() });
      qc.invalidateQueries({ queryKey: queryKeys.games.detail(id) });
    },
  });
}
