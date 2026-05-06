"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { serviceWindowService } from "@/services/service-window/service-window";

import {
  AssignWindowPayload,
} from "@/types/service-window/service-window";

/**
 * Get windows assigned to service
 */
export function useServiceWindows(
  serviceId?: number
) {
  return useQuery({
    queryKey: [
      "service-windows",
      serviceId,
    ],

    queryFn: () =>
      serviceWindowService.getByService(
        serviceId!
      ),

    enabled: !!serviceId,
  });
}

/**
 * Assign windows to service
 */
export function useAssignServiceWindows() {

  const queryClient =
    useQueryClient();

  return useMutation({

    mutationFn: ({
      serviceId,
      payload,
    }: {
      serviceId: number;

      payload: AssignWindowPayload;
    }) =>
      serviceWindowService.assign(
        serviceId,
        payload
      ),

    onSuccess: (
      _,
      variables
    ) => {

      queryClient.invalidateQueries({
        queryKey: ["services"],
      });

      queryClient.invalidateQueries({
        queryKey: ["windows"],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "service-windows",
          variables.serviceId,
        ],
      });
    },
  });
}