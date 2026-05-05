"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { serviceRequestService } from "@/services/service-management/service-request.service";
import type { ServiceRequestItem, ServiceRequestListParams } from "@/types/service-management/service-request.type";

export const serviceRequestKeys = {
  all: ["service-requests"] as const,
  list: (params: ServiceRequestListParams = {}) => [...serviceRequestKeys.all, "list", params] as const,
};

export function useServiceRequestsQuery(params: ServiceRequestListParams = {}) {
  return useQuery({ queryKey: serviceRequestKeys.list(params), queryFn: () => serviceRequestService.list(params) });
}

export function useCreateServiceRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ServiceRequestItem>) => serviceRequestService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: serviceRequestKeys.all }),
  });
}
