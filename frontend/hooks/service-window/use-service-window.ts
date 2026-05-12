"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { serviceWindowService } from "@/services/service-window/service-window";

import {
  AssignWindowPayload,
} from "@/types/service-window/service-window";

/*
|--------------------------------------------------------------------------
| GET SERVICE WINDOWS
|--------------------------------------------------------------------------
*/
export function useServiceWindows(serviceId?: number) {
  return useQuery({
    queryKey: ["service-windows", serviceId],

    queryFn: () => {
      if (!serviceId) return Promise.resolve({ data: [] });
      return serviceWindowService.getByService(serviceId);
    },

    enabled: !!serviceId,
  });
}


/**
 * TOGGLE required flag (NEW)
 */
export function useToggleServiceWindowRequired() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      serviceId,
      windowId,
    }: {
      serviceId: number;
      windowId: number;
    }) =>
      serviceWindowService.toggleRequired(serviceId, windowId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["service-windows", variables.serviceId],
      });
    },
  });
}
/*
|--------------------------------------------------------------------------
| ASSIGN WINDOWS TO SERVICE
|--------------------------------------------------------------------------
*/
export function useAssignServiceWindows() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      serviceId,
      payload,
    }: {
      serviceId: number;
      payload: AssignWindowPayload;
    }) =>
      serviceWindowService.assign(serviceId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["services"],
      });

      queryClient.invalidateQueries({
        queryKey: ["windows"],
      });

      queryClient.invalidateQueries({
        queryKey: ["service-windows", variables.serviceId],
      });
    },
  });
}

/*
|--------------------------------------------------------------------------
| REMOVE WINDOW FROM SERVICE
|--------------------------------------------------------------------------
*/
export function useRemoveServiceWindow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      serviceId,
      windowId,
    }: {
      serviceId: number;
      windowId: number;
    }) =>
      serviceWindowService.remove(serviceId, windowId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["service-windows", variables.serviceId],
      });
    },
  });
}