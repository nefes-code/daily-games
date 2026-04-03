import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/keys";
import type { UpdateUserInput } from "@/services/types";
import {
  createUser,
  getUser,
  getUsers,
  updateUser,
  getUserStreak,
} from "./api";

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.all(),
    queryFn: getUsers,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => getUser(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all() });
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      updateUser(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all() });
      qc.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
    },
  });
}

export function useUserStreak(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.users.streak(id ?? ""),
    queryFn: () => getUserStreak(id!),
    enabled: !!id,
  });
}
