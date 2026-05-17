"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  applicationWorkflowService,
  OfficerActionPayload,
  OfficerWorkflowAction,
} from "@/services/application-workflow/application-workflow";
import {
  ServiceFormField,
  ServiceFormFieldCondition,
  ServiceFormSection,
  ServiceFormStep,
} from "@/types/application-workflow";

const keys = {
  builder: (id: number) => ["service-form-builder", id] as const,
  forms: ["service-forms"] as const,
  serviceApplications: ["service-applications"] as const,
  officerQueue: (filter?: Record<string, unknown>) => ["officer-application-queue", filter ?? {}] as const,
  managerQueue: (filter?: Record<string, unknown>) => ["manager-application-queue", filter ?? {}] as const,
  applications: ["applications"] as const,
  summary: ["application-summary"] as const,
};

export function useServiceFormBuilder(serviceFormId: number) {
  return useQuery({
    queryKey: keys.builder(serviceFormId),
    queryFn: () => applicationWorkflowService.builder.get(serviceFormId),
    enabled: Number.isFinite(serviceFormId) && serviceFormId > 0,
  });
}

export function useApplicationSummary() {
  return useQuery({
    queryKey: keys.summary,
    queryFn: applicationWorkflowService.dashboard.summary,
  });
}

export function useServiceApplications() {
  return useQuery({
    queryKey: keys.serviceApplications,
    queryFn: applicationWorkflowService.serviceApplications.list,
  });
}

export function useServiceApplication(id: number) {
  return useQuery({
    queryKey: ["service-application", id],
    queryFn: () => applicationWorkflowService.serviceApplications.show(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useOfficerApplicationQueue() {
  return useQuery({
    queryKey: keys.officerQueue,
    queryFn: applicationWorkflowService.officer.queue,
  });
}

export function useOfficerApplication(id: number) {
  return useQuery({
    queryKey: ["officer-application", id],
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
      queryClient.invalidateQueries({ queryKey: ["officer-application", id] });
    },
  });
}

export function useBackOfficerApplicationAction(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ action, payload }: { action: "approve" | "reject"; payload?: OfficerActionPayload }) =>
      applicationWorkflowService.officer.backOfficerAction(id, action, payload ?? {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["officer-application-queue"] });
      queryClient.invalidateQueries({ queryKey: ["officer-application", id] });
    },
  });
}

export function useWindowFrontOfficers(windowId?: number, serviceId?: number) {
  return useQuery({
    queryKey: ["window-front-officers", windowId, serviceId],
    queryFn: () => applicationWorkflowService.officer.frontOfficers(Number(windowId), serviceId),
    enabled: Boolean(windowId),
  });
}

export function useOfficerSharingWindows() {
  return useQuery({
    queryKey: ["officer-sharing-windows"],
    queryFn: applicationWorkflowService.officer.sharingWindows,
  });
}

export function useOfficerSharingOfficers(windowId?: number) {
  return useQuery({
    queryKey: ["officer-sharing-officers", windowId],
    queryFn: () => applicationWorkflowService.officer.sharingOfficers(Number(windowId)),
    enabled: Boolean(windowId),
  });
}

export function useManagerApplicationQueue(filter?: { bucket?: string; search?: string; status?: string }) {
  return useQuery({
    queryKey: keys.managerQueue(filter),
    queryFn: () => applicationWorkflowService.manager.queue(filter),
  });
}

export function useManagerApplication(id: number) {
  return useQuery({
    queryKey: ["manager-application", id],
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
      queryClient.invalidateQueries({ queryKey: ["manager-application", id] });
    },
  });
}

export function useApplications() {
  return useQuery({
    queryKey: keys.applications,
    queryFn: applicationWorkflowService.applications.list,
  });
}

export function useApplication(id: number) {
  return useQuery({
    queryKey: ["application", id],
    queryFn: () => applicationWorkflowService.applications.show(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useCreateServiceFormStep(serviceFormId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<ServiceFormStep>) =>
      applicationWorkflowService.steps.create({
        service_form_id: serviceFormId,
        ...payload,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.builder(serviceFormId) }),
  });
}

export function useUpdateServiceFormStep(serviceFormId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ServiceFormStep> }) =>
      applicationWorkflowService.steps.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.builder(serviceFormId) }),
  });
}

export function useDeleteServiceFormStep(serviceFormId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applicationWorkflowService.steps.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.builder(serviceFormId) }),
  });
}

export function useCreateServiceFormSection(serviceFormId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<ServiceFormSection>) =>
      applicationWorkflowService.sections.create({
        service_form_id: serviceFormId,
        ...payload,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.builder(serviceFormId) }),
  });
}

export function useUpdateServiceFormSection(serviceFormId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ServiceFormSection> }) =>
      applicationWorkflowService.sections.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.builder(serviceFormId) }),
  });
}

export function useDeleteServiceFormSection(serviceFormId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applicationWorkflowService.sections.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.builder(serviceFormId) }),
  });
}

export function useCreateServiceFormField(serviceFormId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<ServiceFormField>) =>
      applicationWorkflowService.fields.create({
        service_form_id: serviceFormId,
        ...payload,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.builder(serviceFormId) }),
  });
}

export function useUpdateServiceFormField(serviceFormId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ServiceFormField> }) =>
      applicationWorkflowService.fields.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.builder(serviceFormId) }),
  });
}

export function useDeleteServiceFormField(serviceFormId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applicationWorkflowService.fields.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.builder(serviceFormId) }),
  });
}

export function useCreateServiceFormCondition(serviceFormId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<ServiceFormFieldCondition>) => applicationWorkflowService.conditions.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.builder(serviceFormId) }),
  });
}

export function useDeleteServiceFormCondition(serviceFormId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applicationWorkflowService.conditions.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.builder(serviceFormId) }),
  });
}
