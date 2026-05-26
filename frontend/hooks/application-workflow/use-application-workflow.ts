"use client";

import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { applicationWorkflowService } from "@/services/application-workflow/application-workflow";

type Id = string | number;
const workflow: any = applicationWorkflowService;

export function useApplicationSummary() {
  return useQuery({
    queryKey: ["application-summary"],
    queryFn: () =>
      workflow.dashboard?.summary?.() ??
      workflow.dashboard?.stats?.() ??
      workflow.dashboard?.index?.(),
  });
}

export function useApplication(id: Id) {
  return useQuery({
    queryKey: ["application", id],
    queryFn: () => workflow.applications?.show?.(Number(id)),
    enabled: Boolean(id),
  });
}

export function useServiceApplication(id: Id) {
  return useApplication(id);
}

export function useServiceApplications(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["service-applications", params],
    queryFn: () => workflow.applications?.list?.(params),
  });
}

export function useOfficerApplicationQueue(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["officer-applications", params],
    queryFn: () => workflow.officer?.queue?.(params),
  });
}

export function useOfficerApplication(id: Id) {
  return useApplication(id);
}

export function useManagerApplicationQueue(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["manager-applications", params],
    queryFn: () => workflow.manager?.queue?.(params),
  });
}

export function useManagerApplication(id: Id) {
  return useApplication(id);
}

export function useOfficerApplicationAction(_id?: Id) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) =>
      workflow.officer?.action?.(payload) ??
      workflow.officer?.update?.(payload),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useBackOfficerApplicationAction(_id?: Id) {
  return useOfficerApplicationAction(_id);
}

export function useManagerApplicationAction(_id?: Id) {
  const qc = useQueryClient();

  return useMutation({
<<<<<<< HEAD
    mutationFn: (payload: any) =>
      workflow.manager?.action?.(payload) ??
      workflow.manager?.update?.(payload),
    onSuccess: () => qc.invalidateQueries(),
=======
    mutationFn: ({ action, payload }: { action: "approve" | "reject" | "return" | "share" | "escalate-to-manager"; payload?: OfficerActionPayload }) =>
      applicationWorkflowService.officer.backOfficerAction(id, action, payload ?? {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["officer-application-queue"] });
      queryClient.invalidateQueries({ queryKey: ["officer-application", id] });
    },
>>>>>>> a70d7379f653b971c5d56277ba4866695c88fe59
  });
}

export function useOfficerSharingWindows(
  paramsOrEnabled?: Record<string, any> | boolean
) {
  const enabled = typeof paramsOrEnabled === "boolean" ? paramsOrEnabled : true;
  const params = typeof paramsOrEnabled === "boolean" ? undefined : paramsOrEnabled;

  return useQuery({
<<<<<<< HEAD
    queryKey: ["officer-sharing-windows", params],
    queryFn: () =>
      workflow.sharing?.windows?.(params) ??
      workflow.officer?.sharingWindows?.(params),
=======
    queryKey: ["window-front-officers", windowId, serviceId],
    queryFn: () => applicationWorkflowService.officer.frontOfficers(Number(windowId), serviceId),
    enabled: Boolean(windowId),
  });
}



export type OfficerSharingWindow = {
  id: number;
  name: string;
  title?: string | null;
  display_name?: string | null;
  level?: string | null;
};

export type OfficerSharingOfficer = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  role_names?: string[];
};

function unwrapList<T>(response: any): T[] {
  const body = response?.data;
  const value = body?.data ?? body;

  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;

  return [];
}

export function useOfficerSharingWindows(enabled = true, serviceId?: number) {
  return useQuery({
    queryKey: ["officer-sharing-windows", serviceId],
    queryFn: async () => {
      const response = await api.get("/officer/sharing/windows", {
        params: { service_id: serviceId },
      });
      return unwrapList<OfficerSharingWindow>(response);
    },
>>>>>>> a70d7379f653b971c5d56277ba4866695c88fe59
    enabled,
  });
}

export function useOfficerSharingOfficers(windowId?: Id, enabled = true) {
  return useQuery({
    queryKey: ["officer-sharing-officers", windowId],
    queryFn: () =>
      workflow.sharing?.officers?.(windowId) ??
      workflow.officer?.sharingOfficers?.(windowId),
    enabled: Boolean(windowId) && enabled,
  });
}

export function useServiceFormBuilder(id: Id) {
  return useQuery({
    queryKey: ["service-form-builder", id],
    queryFn: () =>
      workflow.builder?.show?.(Number(id)) ??
      workflow.forms?.show?.(Number(id)),
    enabled: Boolean(id),
  });
}

export function useCreateServiceFormStep(serviceFormId?: Id) {
  return useMutation({
    mutationFn: (payload: any) =>
      workflow.steps?.create?.({ service_form_id: serviceFormId, ...payload }),
  });
}

export function useCreateServiceFormSection(serviceFormId?: Id) {
  return useMutation({
    mutationFn: (payload: any) =>
      workflow.sections?.create?.({ service_form_id: serviceFormId, ...payload }),
  });
}

export function useCreateServiceFormField(serviceFormId?: Id) {
  return useMutation({
    mutationFn: (payload: any) =>
      workflow.fields?.create?.({ service_form_id: serviceFormId, ...payload }),
  });
}

export function useUpdateServiceFormField(_serviceFormId?: Id) {
  return useMutation({
    mutationFn: (payload: any) =>
      workflow.fields?.update?.(Number(payload.id), payload),
  });
}

export function useDeleteServiceFormField(_serviceFormId?: Id) {
  return useMutation({
    mutationFn: (id: Id) => workflow.fields?.remove?.(Number(id)),
  });
}

export function useCreateServiceFormCondition(serviceFormId?: Id) {
  return useMutation({
    mutationFn: (payload: any) =>
      workflow.conditions?.create?.({ service_form_id: serviceFormId, ...payload }),
  });
}

export function useDeleteServiceFormCondition(_serviceFormId?: Id) {
  return useMutation({
    mutationFn: (id: Id) => workflow.conditions?.remove?.(Number(id)),
  });
}
export function useApplicationDashboardStats() {
  return useQuery({
    queryKey: ["application-dashboard-stats"],
    queryFn: async () => ({
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
    }),
  });
}