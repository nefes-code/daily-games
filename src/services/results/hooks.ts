import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/keys";
import type { ResultsFilter } from "@/services/types";
import { getResults, submitResult } from "./api";

export function useTodayPlayedGameIds(userId: string | undefined): Set<string> {
  const today = new Date().toISOString().split("T")[0];
  const { data } = useQuery({
    queryKey: queryKeys.results.filtered({ date: today, userId }),
    queryFn: () => getResults({ date: today, userId }),
    enabled: !!userId,
  });
  return new Set((data ?? []).map((r) => r.gameId));
}

export function useResults(filters: ResultsFilter = {}) {
  const hasGameIdFilter = "gameId" in filters;
  return useQuery({
    queryKey: queryKeys.results.filtered(filters),
    queryFn: () => getResults(filters),
    enabled: !hasGameIdFilter || !!filters.gameId,
  });
}

export function useSubmitResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submitResult,
    onSuccess: (result) => {
      // Invalida todas as queries de resultados (qualquer filtro)
      qc.invalidateQueries({ queryKey: queryKeys.results.all() });
      // Invalida também o ranking do jogo específico
      qc.invalidateQueries({
        queryKey: queryKeys.results.filtered({ gameId: result.gameId }),
      });
      // Invalida a leaderboard do jogo (slug via game relation)
      if (result.game?.slug) {
        qc.invalidateQueries({
          queryKey: queryKeys.games.leaderboard(result.game.slug),
        });
      }
    },
  });
}
