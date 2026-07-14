"use client";

import { useQuery } from "@tanstack/react-query";

import { customerApplicationService } from "@/services/customer/customer-application.service";

export function useCustomerApplications(params: {
  page?: number;
  search?: string;
  status?: string;
} = {}) {
  return useQuery({
    queryKey: ["customer-service-applications", params],
    queryFn: () => customerApplicationService.list(params),
  });
}
export function useCustomerApplication(id: number) {
  return useQuery({
    queryKey: ["customer-application", id],
    queryFn: () => customerApplicationService.show(id),
    enabled: !!id && id > 0,

    // 👇 CRITICAL for queue tracking screen
    refetchInterval: 5000,
    staleTime: 1000 * 10,
  });
}
