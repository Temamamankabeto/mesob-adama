"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  applicationWorkflowService,
  ManagerActionPayload,
  ManagerWorkflowAction,
  OfficerActionPayload,
  OfficerWorkflowAction,
} from "@/services/application-workflow/application-workflow";

export const applicationWorkflowKeys = {
  officerQueue: (filter?: Record<string, unknown>) => ["officer-application-queue", filter ?? {}] as const,
  officerApplication: (id: number) => ["officer-application", id] as const,
  officerSharingWindows: ["officer-sharing-windows"] as const,
  officerSharingOfficers: (windowId?: number) => ["officer-sharing-officers", windowId] as const,
  managerQueue: (filter?: Record<string, unknown>) => ["manager-application-queue", filter ?? {}] as const,
  managerApplication: (id: number) => ["manager-application", id] as const,
};

export function useOfficerApplicationQueue(filter?: { bucket?: string; search?: string; status?: string }) {
  return useQuery({
    queryKey: applicationWorkflowKeys.officerQueue(filter),
    queryFn: () => applicationWorkflowService.officer.queue(filter),
  });
}

export function useOfficerApplication(id: number) {
  return useQuery({
    queryKey: applicationWorkflowKeys.officerApplication(id),
    queryFn: () => applicationWorkflowService.officer.show(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useOfficerApplicationAction(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ action, payload }: { action: OfficerWorkflowAction; payload?: OfficerActionPayload }) =>
      applicationWorkflowService.officer.action(id, action, payload ?? {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["officer-application-queue"] });
      queryClient.invalidateQueries({ queryKey: applicationWorkflowKeys.officerApplication(id) });
    },
  });
}

export function useBackOfficerApplicationAction(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      action,
      payload,
    }: {
      action: "approve" | "reject" | "return" | "share" | "escalate-to-manager";
      payload?: OfficerActionPayload;
    }) => applicationWorkflowService.officer.backOfficerAction(id, action, payload ?? {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["officer-application-queue"] });
      queryClient.invalidateQueries({ queryKey: applicationWorkflowKeys.officerApplication(id) });
    },
  });
}

export function useOfficerSharingWindows(enabled = true) {
  return useQuery({
    queryKey: applicationWorkflowKeys.officerSharingWindows,
    queryFn: applicationWorkflowService.officer.sharingWindows,
    enabled,
  });
}

export function useOfficerSharingOfficers(windowId?: number, enabled = true) {
  return useQuery({
    queryKey: applicationWorkflowKeys.officerSharingOfficers(windowId),
    queryFn: () => applicationWorkflowService.officer.sharingOfficers(Number(windowId)),
    enabled: enabled && Boolean(windowId),
  });
}

export function useManagerApplicationQueue(filter?: { bucket?: string; search?: string; status?: string }) {
  return useQuery({
    queryKey: applicationWorkflowKeys.managerQueue(filter),
    queryFn: () => applicationWorkflowService.manager.queue(filter),
  });
}

export function useManagerApplication(id: number) {
  return useQuery({
    queryKey: applicationWorkflowKeys.managerApplication(id),
    queryFn: () => applicationWorkflowService.manager.show(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useManagerApplicationAction(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ action, payload }: { action: ManagerWorkflowAction; payload?: ManagerActionPayload }) =>
      applicationWorkflowService.manager.action(id, action, payload ?? {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-application-queue"] });
      queryClient.invalidateQueries({ queryKey: applicationWorkflowKeys.managerApplication(id) });
    },
  });
}
