"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { serviceService } from "@/services/service/service";

import {
  ServicePayload,
} from "@/types/services/service";

export const useServices = ({
  page,
  search,
}: {
  page: number;
  search: string;
}) => {
  return useQuery({
    queryKey: ["services", page, search],

    queryFn: async () => {
      return await serviceService.getAll(page, search);
    },

    placeholderData: (prev) => prev,
  });
};
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