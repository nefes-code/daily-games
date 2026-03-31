import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/keys";
import type { ResultsFilter } from "@/services/types";
import { getResults, submitResult } from "./api";
import { getToday } from "@/utils/date";

export function useTodayPlayedGameIds(userId: string | undefined): Set<string> {
  const today = getToday();
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
      // Normaliza: pode ser um resultado ou array
      const first = Array.isArray(result) ? result[0] : result;
      if (!first) return;
      // Invalida também o ranking do jogo específico
      qc.invalidateQueries({
        queryKey: queryKeys.results.filtered({ gameId: first.gameId }),
      });
      // Invalida a leaderboard do jogo (slug via game relation)
      if (first.game?.slug) {
        qc.invalidateQueries({
          queryKey: queryKeys.games.leaderboard(first.game.slug),
        });
      }
    },
  });
}
