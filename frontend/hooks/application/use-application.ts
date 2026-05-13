"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { applicationService } from "@/services/application/application";

export function useApplicationForm(serviceId: number) {
  return useQuery({
    queryKey: ["application-form", serviceId],
    queryFn: () => applicationService.getForm(serviceId),
    enabled: !!serviceId,
  });
}

export function useApplyService(serviceId: number) {
  return useMutation({
    mutationFn: ({ values, files }: { values: Record<string, unknown>; files?: Record<string, File | null> }) =>
      applicationService.apply(serviceId, values, files ?? {}),
  });
}

export function useTrackApplication() {
  return useMutation({
    mutationFn: applicationService.track,
  });
}
