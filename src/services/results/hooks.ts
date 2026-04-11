import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/keys";
import type { ResultsFilter } from "@/services/types";
import { getResults, submitResult, applyBoost } from "./api";
import { getToday } from "@/utils/date";
import { useSession } from "next-auth/react";

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
  const { data: session } = useSession();
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
      // Invalida o streak do usuário logado
      if (session?.user?.id) {
        qc.invalidateQueries({
          queryKey: queryKeys.users.streak(session.user.id),
        });
      }
    },
  });
}

export function useApplyBoost() {
  const qc = useQueryClient();
  const { data: session } = useSession();
  return useMutation({
    mutationFn: applyBoost,
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: queryKeys.results.all() });
      if (result.gameId) {
        qc.invalidateQueries({
          queryKey: queryKeys.results.filtered({ gameId: result.gameId }),
        });
      }
      if (result.game?.slug) {
        qc.invalidateQueries({
          queryKey: queryKeys.games.leaderboard(result.game.slug),
        });
      }
      if (session?.user?.id) {
        qc.invalidateQueries({
          queryKey: queryKeys.users.streak(session.user.id),
        });
        qc.invalidateQueries({
          queryKey: queryKeys.users.boost(session.user.id),
        });
      }
    },
  });
}
