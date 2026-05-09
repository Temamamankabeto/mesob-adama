"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { officerApplicationService } from "@/services/officer-application/officer-application";

export function useOfficerQueue() {
  return useQuery({
    queryKey: ["officer-queue"],
    queryFn: () =>
      officerApplicationService.queue(),
  });
}

export function useApproveApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: any) =>
      officerApplicationService.approve(
        id,
        payload
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["officer-queue"],
      });
    },
  });
}