"use client";

import api from "@/lib/api";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { applicationWorkflowService } from "@/services/application-workflow/application-workflow";

type Id = string | number;

const workflow: any = applicationWorkflowService;

function dataFrom<T = any>(response: any): T {
  return (response?.data?.data ?? response?.data ?? response) as T;
}

function listFrom<T = any>(value: any): T[] {
  const data = value?.data ?? value;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;

  return [];
}

function normalizeFieldPayload(payload: any) {
  const next = { ...(payload ?? {}) };

  if (
    next.section_id !== undefined &&
    next.service_form_section_id === undefined
  ) {
    next.service_form_section_id = next.section_id;
  }

  delete next.section_id;

  if (typeof next.validation_rules === "string") {
    next.validation_rules = next.validation_rules
      ? next.validation_rules
          .split("|")
          .map((item: string) => item.trim())
          .filter(Boolean)
      : [];
  }

  if (
    typeof next.options === "string" &&
    ["select", "radio", "checkbox"].includes(String(next.type || ""))
  ) {
    next.options = next.options
      .split(",")
      .map((item: string) => item.trim())
      .filter(Boolean);
  }

  return next;
}

function normalizeConditionPayload(payload: any) {
  const next = { ...(payload ?? {}) };

  if (!next.operator) {
    next.operator = "equals";
  }

  delete next.service_form_id;
  delete next.action;

  return next;
}

function builderDataFrom(form: any) {
  const steps = listFrom(form?.steps).sort(
    (a: any, b: any) =>
      Number(a.step_order ?? a.sort_order ?? 0) -
      Number(b.step_order ?? b.sort_order ?? 0)
  );

  const sectionsFromSteps = steps.flatMap((step: any) =>
    listFrom(step.sections).map((section: any) => ({
      ...section,
      service_form_step_id: section.service_form_step_id ?? step.id,
    }))
  );

  const rootSections = listFrom(form?.sections);

  const sectionsMap = new Map<number, any>();

  [...sectionsFromSteps, ...rootSections].forEach((section: any) => {
    if (section?.id) {
      sectionsMap.set(Number(section.id), section);
    }
  });

  const sections = Array.from(sectionsMap.values()).sort(
    (a: any, b: any) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)
  );

  const fieldsFromSections = sections.flatMap((section: any) =>
    listFrom(section.fields).map((field: any) => ({
      ...field,
      service_form_section_id:
        field.service_form_section_id ?? field.section_id ?? section.id,
      section_id: field.section_id ?? field.service_form_section_id ?? section.id,
    }))
  );

  const rootFields = listFrom(form?.fields);

  const fieldsMap = new Map<number, any>();

  [...fieldsFromSections, ...rootFields].forEach((field: any) => {
    if (field?.id) {
      fieldsMap.set(Number(field.id), {
        ...field,
        section_id: field.section_id ?? field.service_form_section_id ?? null,
      });
    }
  });

  const fields = Array.from(fieldsMap.values()).sort(
    (a: any, b: any) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)
  );

  const conditions = fields.flatMap((field: any) =>
    listFrom(field.conditions).map((condition: any) => ({
      ...condition,
      field_id: condition.field_id ?? field.id,
    }))
  );

  return {
    form,
    steps,
    sections,
    fields,
    conditions,
  };
}

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
    mutationFn: (payload: any) =>
      workflow.manager?.action?.(payload) ??
      workflow.manager?.update?.(payload),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useOfficerSharingWindows(
  paramsOrEnabled?: Record<string, any> | boolean
) {
  const enabled = typeof paramsOrEnabled === "boolean" ? paramsOrEnabled : true;
  const params = typeof paramsOrEnabled === "boolean" ? undefined : paramsOrEnabled;

  return useQuery({
    queryKey: ["officer-sharing-windows", params],
    queryFn: () =>
      workflow.sharing?.windows?.(params) ??
      workflow.officer?.sharingWindows?.(params),
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

/*
|--------------------------------------------------------------------------
| Service Form Builder
|--------------------------------------------------------------------------
| Root cause fixed:
| previous hooks called applicationWorkflowService.builder/forms/fields,
| but those objects are empty in the latest frontend zip. These hooks now
| use the real Laravel API endpoints directly.
*/
export function useServiceFormBuilder(id: Id) {
  return useQuery({
    queryKey: ["service-form-builder", Number(id)],
    queryFn: async () => {
      const response = await api.get(`/admin/service-forms/${Number(id)}`);
      return builderDataFrom(dataFrom(response));
    },
    enabled: Number.isFinite(Number(id)) && Number(id) > 0,
  });
}

export function useCreateServiceFormStep(serviceFormId?: Id) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const response = await api.post("/admin/service-form-steps", {
        service_form_id: Number(serviceFormId),
        title: payload.title,
        step_order: Number(payload.step_order ?? payload.sort_order ?? 1),
      });

      return dataFrom(response);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["service-form-builder", Number(serviceFormId)],
      });
    },
  });
}

export function useCreateServiceFormSection(serviceFormId?: Id) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const response = await api.post("/admin/service-form-sections", {
        service_form_id: Number(serviceFormId),
        service_form_step_id: payload.service_form_step_id ?? null,
        title: payload.title,
        description: payload.description ?? null,
        sort_order: Number(payload.sort_order ?? 1),
        is_active: payload.is_active ?? true,
      });

      return dataFrom(response);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["service-form-builder", Number(serviceFormId)],
      });
    },
  });
}

export function useCreateServiceFormField(serviceFormId?: Id) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const response = await api.post(
        "/admin/service-form-fields",
        normalizeFieldPayload({
          service_form_id: Number(serviceFormId),
          ...payload,
        })
      );

      const field = dataFrom(response);

      return {
        ...field,
        section_id: field.section_id ?? field.service_form_section_id ?? null,
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["service-form-builder", Number(serviceFormId)],
      });
    },
  });
}

export function useUpdateServiceFormField(serviceFormId?: Id) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: Id; payload: any }) => {
      const response = await api.put(
        `/admin/service-form-fields/${Number(id)}`,
        normalizeFieldPayload(payload)
      );

      return dataFrom(response);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["service-form-builder", Number(serviceFormId)],
      });
    },
  });
}

export function useDeleteServiceFormField(serviceFormId?: Id) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: Id) => {
      await api.delete(`/admin/service-form-fields/${Number(id)}`);
      return Number(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["service-form-builder", Number(serviceFormId)],
      });
    },
  });
}

export function useCreateServiceFormCondition(serviceFormId?: Id) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const response = await api.post(
        "/admin/service-form-field-conditions",
        normalizeConditionPayload(payload)
      );

      return dataFrom(response);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["service-form-builder", Number(serviceFormId)],
      });
    },
  });
}

export function useDeleteServiceFormCondition(serviceFormId?: Id) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: Id) => {
      await api.delete(`/admin/service-form-field-conditions/${Number(id)}`);
      return Number(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["service-form-builder", Number(serviceFormId)],
      });
    },
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
