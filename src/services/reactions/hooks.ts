import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/keys";
import { addReaction, removeReaction } from "./api";

export function useAddReaction(gameId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ resultId, emoji }: { resultId: string; emoji: string }) =>
      addReaction(resultId, emoji),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.results.filtered({ gameId }),
      });
    },
  });
}

export function useRemoveReaction(gameId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (resultId: string) => removeReaction(resultId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.results.filtered({ gameId }),
      });
    },
  });
}
