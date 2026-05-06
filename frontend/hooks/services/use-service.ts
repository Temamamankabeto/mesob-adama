"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { serviceService } from "@/services/service/service";

import {
  ServicePayload,
} from "@/types/services/service";

export function useServices(page = 1) {
  return useQuery({
    queryKey: ["services", page],
    queryFn: () => serviceService.getAll(page),
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ServicePayload) =>
      serviceService.create(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["services"],
      });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<ServicePayload>;
    }) => serviceService.update(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["services"],
      });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      serviceService.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["services"],
      });
    },
  });
}