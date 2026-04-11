import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/keys";
import type { UpdateUserInput } from "@/services/types";
import {
  createUser,
  getUser,
  getUsers,
  updateUser,
  getUserStreak,
  getUserBoostInfo,
  getUserRescueInfo,
  attemptStreakRescue,
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

export function useUserBoostInfo(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.users.boost(id ?? ""),
    queryFn: () => getUserBoostInfo(id!),
    enabled: !!id,
  });
}

export function useUserRescueInfo(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.users.rescue(id ?? ""),
    queryFn: () => getUserRescueInfo(id!),
    enabled: !!id,
  });
}

export function useAttemptRescue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => attemptStreakRescue(userId),
    onSuccess: (_, userId) => {
      qc.invalidateQueries({ queryKey: queryKeys.users.streak(userId) });
      qc.invalidateQueries({ queryKey: queryKeys.users.rescue(userId) });
      qc.invalidateQueries({ queryKey: queryKeys.users.boost(userId) });
    },
  });
}
