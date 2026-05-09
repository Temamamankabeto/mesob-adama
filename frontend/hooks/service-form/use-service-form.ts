"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { serviceFormService } from "@/services/service-form/service-form";

export function useServiceForms() {
  return useQuery({
    queryKey: ["service-forms"],
    queryFn: () =>
      serviceFormService.getAll(),
  });
}

export function useCreateServiceForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceFormService.create,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["service-forms"],
      });
    },
  });
}