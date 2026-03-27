import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/keys";
import type { ResultsFilter } from "@/services/types";
import { getResults, submitResult } from "./api";

export function useResults(filters: ResultsFilter = {}) {
  return useQuery({
    queryKey: queryKeys.results.filtered(filters),
    queryFn: () => getResults(filters),
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
    },
  });
}
