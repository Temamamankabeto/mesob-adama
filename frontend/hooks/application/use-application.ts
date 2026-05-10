"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { applicationService, officerApplicationService } from "@/services/application/application";

export function useApplicationForm(
  serviceId: number
) {
  return useQuery({
    queryKey: [
      "application-form",
      serviceId,
    ],

    queryFn: () =>
      applicationService.getForm(
        serviceId
      ),

    enabled: !!serviceId,
  });
}

export function useApplyService(
  serviceId: number
) {
  return useMutation({
    mutationFn: (
      payload: FormData
    ) =>
      applicationService.apply(
        serviceId,
        payload
      ),
  });
}

export function useTrackApplication() {
  return useMutation({
    mutationFn:
      applicationService.track,
  });
}


// officer application  will be able to see the application details and update the status of the application

export function useOfficerQueue() {
  return useQuery({
    queryKey: ["officer-queue"],
    queryFn: () =>
      officerApplicationService.queue(),
  });
}

export function useApproveApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: any) =>
      officerApplicationService.approve(
        id,
        payload
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["officer-queue"],
      });
    },
  });
}



// use application details
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () =>
      applicationService.getDashboardStats(),
  });
}

export function useMyApplications() {
  return useQuery({
    queryKey: ["my-applications"],
    queryFn: () =>
      applicationService.getMyApplications(),
  });
}