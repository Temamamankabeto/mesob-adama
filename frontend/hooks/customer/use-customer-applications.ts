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
    queryKey: ["customer-service-application", id],
    queryFn: () => customerApplicationService.show(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}
