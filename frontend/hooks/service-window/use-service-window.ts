"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api";

export type ServiceWindowBoardService = {
  id: number;
  name: string;
  description?: string | null;
  service_fee?: number;
  availability?: any;
  status?: string;
  windows?: any[];
};

export type ServiceWindowBoardWindow = {
  id: number;
  name: string;
  availability?: any;
  services?: ServiceWindowBoardService[];
};

export type ServiceWindowBoard = {
  services: ServiceWindowBoardService[];
  windows: ServiceWindowBoardWindow[];
};

function unwrap<T>(response: any): T {
  return response?.data?.data ?? response?.data;
}

function invalidateServiceWindowQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["service-window-board"] });
  queryClient.invalidateQueries({ queryKey: ["service-window-list"] });
  queryClient.invalidateQueries({ queryKey: ["service-windows"] });
  queryClient.invalidateQueries({ queryKey: ["services"] });
  queryClient.invalidateQueries({ queryKey: ["windows"] });
}

/*
|--------------------------------------------------------------------------
| Existing assignment hooks
|--------------------------------------------------------------------------
*/

export function useAssignServiceWindow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serviceId,
      service_id,
      windows,
    }: {
      serviceId?: number;
      service_id?: number;
      windows: Array<{
        window_id: number;
        step_order: number;
        is_required: boolean;
      }>;
    }) => {
      const id = serviceId ?? service_id;

      const response = await api.post(`/services/${id}/windows`, {
        windows,
      });

      return unwrap(response);
    },
    onSuccess: () => invalidateServiceWindowQueries(queryClient),
  });
}

export function useServiceWindows(serviceId?: number) {
  return useQuery({
    queryKey: ["service-windows", serviceId],
    queryFn: async () => {
      const response = await api.get(`/services/${serviceId}/windows`);
      return unwrap(response);
    },
    enabled: Boolean(serviceId),
  });
}

/*
|--------------------------------------------------------------------------
| Drag/drop board hooks
|--------------------------------------------------------------------------
*/

export function useServiceWindowBoard() {
  return useQuery<ServiceWindowBoard>({
    queryKey: ["service-window-board"],
    queryFn: async () => {
      const response = await api.get("/service-window/board");
      return unwrap<ServiceWindowBoard>(response);
    },
  });
}

export function useMoveServiceWindow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      service_id,
      serviceId,
      window_id,
      windowId,
      step_order = 1,
      is_required = true,
    }: {
      service_id?: number;
      serviceId?: number;
      window_id?: number;
      windowId?: number;
      step_order?: number;
      is_required?: boolean;
    }) => {
      const response = await api.post("/service-window/move", {
        service_id: service_id ?? serviceId,
        window_id: window_id ?? windowId,
        step_order,
        is_required,
      });

      return unwrap(response);
    },
    onSuccess: () => invalidateServiceWindowQueries(queryClient),
  });
}

/*
|--------------------------------------------------------------------------
| Aliases used by pages
|--------------------------------------------------------------------------
*/

export const useMoveServiceToWindow = useMoveServiceWindow;

export function useRemoveServiceFromWindow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input:
        | number
        | {
            service_id?: number;
            serviceId?: number;
          }
    ) => {
      const serviceId =
        typeof input === "number"
          ? input
          : input.service_id ?? input.serviceId;

      const response = await api.delete(`/service-window/services/${serviceId}`);

      return unwrap(response);
    },
    onSuccess: () => invalidateServiceWindowQueries(queryClient),
  });
}

/*
|--------------------------------------------------------------------------
| Backward-compatible alias
|--------------------------------------------------------------------------
| Current /dashboard/service-window/page.tsx imports this exact name.
*/
export const useUnassignServiceWindow = useRemoveServiceFromWindow;
export const useUnassignServiceFromWindow = useRemoveServiceFromWindow;
