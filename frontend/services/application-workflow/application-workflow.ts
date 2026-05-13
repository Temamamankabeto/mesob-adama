import api, { unwrap } from "@/lib/api";

import {
  ApiResponse,
  Application,
  ApplicationSummary,
  BuilderData,
  ServiceApplication,
  ServiceForm,
  ServiceFormField,
  ServiceFormFieldCondition,
  ServiceFormSection,
  ServiceFormStep,
} from "@/types/application-workflow";

function listFrom<T>(body: any): T[] {
  const value = body?.data;

  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;

  return [];
}

function dataFrom<T>(body: any): T {
  return body?.data as T;
}

function params(filter?: Record<string, unknown>) {
  return {
    params: Object.fromEntries(
      Object.entries(filter ?? {}).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ),
  };
}

export const applicationWorkflowService = {
  forms: {
    async list() {
      const response = await api.get("/admin/service-forms");
      return listFrom<ServiceForm>(unwrap<ApiResponse<any>>(response));
    },

    async show(id: number) {
      const response = await api.get(`/admin/service-forms/${id}`);
      return dataFrom<ServiceForm>(unwrap<ApiResponse<ServiceForm>>(response));
    },

    async create(payload: Partial<ServiceForm>) {
      const response = await api.post("/admin/service-forms", payload);
      return dataFrom<ServiceForm>(unwrap<ApiResponse<ServiceForm>>(response));
    },

    async update(id: number, payload: Partial<ServiceForm>) {
      const response = await api.put(`/admin/service-forms/${id}`, payload);
      return dataFrom<ServiceForm>(unwrap<ApiResponse<ServiceForm>>(response));
    },

    async remove(id: number) {
      const response = await api.delete(`/admin/service-forms/${id}`);
      return unwrap<ApiResponse<null>>(response);
    },
  },

  steps: {
    async list(serviceFormId?: number) {
      const response = await api.get("/admin/service-form-steps", params({ service_form_id: serviceFormId }));
      const body = unwrap<ApiResponse<any>>(response);
      return listFrom<ServiceFormStep>(body).filter((item) => !serviceFormId || item.service_form_id === serviceFormId);
    },

    async create(payload: Partial<ServiceFormStep>) {
      const response = await api.post("/admin/service-form-steps", payload);
      return dataFrom<ServiceFormStep>(unwrap<ApiResponse<ServiceFormStep>>(response));
    },

    async update(id: number, payload: Partial<ServiceFormStep>) {
      const response = await api.put(`/admin/service-form-steps/${id}`, payload);
      return dataFrom<ServiceFormStep>(unwrap<ApiResponse<ServiceFormStep>>(response));
    },

    async remove(id: number) {
      const response = await api.delete(`/admin/service-form-steps/${id}`);
      return unwrap<ApiResponse<null>>(response);
    },
  },

  sections: {
    async list(serviceFormId?: number) {
      const response = await api.get("/admin/service-form-sections", params({ service_form_id: serviceFormId }));
      const body = unwrap<ApiResponse<any>>(response);
      return listFrom<ServiceFormSection>(body).filter((item) => !serviceFormId || item.service_form_id === serviceFormId);
    },

    async create(payload: Partial<ServiceFormSection>) {
      const response = await api.post("/admin/service-form-sections", payload);
      return dataFrom<ServiceFormSection>(unwrap<ApiResponse<ServiceFormSection>>(response));
    },

    async update(id: number, payload: Partial<ServiceFormSection>) {
      const response = await api.put(`/admin/service-form-sections/${id}`, payload);
      return dataFrom<ServiceFormSection>(unwrap<ApiResponse<ServiceFormSection>>(response));
    },

    async remove(id: number) {
      const response = await api.delete(`/admin/service-form-sections/${id}`);
      return unwrap<ApiResponse<null>>(response);
    },
  },

  fields: {
    async list(serviceFormId?: number) {
      const response = await api.get("/admin/service-form-fields", params({ service_form_id: serviceFormId }));
      const body = unwrap<ApiResponse<any>>(response);
      return listFrom<ServiceFormField>(body).filter((item) => !serviceFormId || item.service_form_id === serviceFormId);
    },

    async create(payload: Partial<ServiceFormField>) {
      const response = await api.post("/admin/service-form-fields", payload);
      return dataFrom<ServiceFormField>(unwrap<ApiResponse<ServiceFormField>>(response));
    },

    async update(id: number, payload: Partial<ServiceFormField>) {
      const response = await api.put(`/admin/service-form-fields/${id}`, payload);
      return dataFrom<ServiceFormField>(unwrap<ApiResponse<ServiceFormField>>(response));
    },

    async remove(id: number) {
      const response = await api.delete(`/admin/service-form-fields/${id}`);
      return unwrap<ApiResponse<null>>(response);
    },
  },

  conditions: {
    async list(fieldId?: number) {
      const response = await api.get("/admin/service-form-field-conditions", params({ field_id: fieldId }));
      const body = unwrap<ApiResponse<any>>(response);
      return listFrom<ServiceFormFieldCondition>(body).filter((item) => !fieldId || item.field_id === fieldId);
    },

    async create(payload: Partial<ServiceFormFieldCondition>) {
      const response = await api.post("/admin/service-form-field-conditions", payload);
      return dataFrom<ServiceFormFieldCondition>(unwrap<ApiResponse<ServiceFormFieldCondition>>(response));
    },

    async update(id: number, payload: Partial<ServiceFormFieldCondition>) {
      const response = await api.put(`/admin/service-form-field-conditions/${id}`, payload);
      return dataFrom<ServiceFormFieldCondition>(unwrap<ApiResponse<ServiceFormFieldCondition>>(response));
    },

    async remove(id: number) {
      const response = await api.delete(`/admin/service-form-field-conditions/${id}`);
      return unwrap<ApiResponse<null>>(response);
    },
  },

  builder: {
    async get(serviceFormId: number): Promise<BuilderData> {
      const [form, steps, sections, fields, allConditions] = await Promise.all([
        applicationWorkflowService.forms.show(serviceFormId),
        applicationWorkflowService.steps.list(serviceFormId),
        applicationWorkflowService.sections.list(serviceFormId),
        applicationWorkflowService.fields.list(serviceFormId),
        applicationWorkflowService.conditions.list(),
      ]);

      const fieldIds = new Set(fields.map((field) => field.id));
      const conditions = allConditions.filter((condition) => fieldIds.has(condition.field_id));

      return {
        form,
        steps,
        sections,
        fields: fields.map((field) => ({
          ...field,
          conditions: conditions.filter((condition) => condition.field_id === field.id),
        })),
        conditions,
      };
    },
  },

  serviceApplications: {
    async list() {
      const response = await api.get("/admin/service-applications");
      return listFrom<ServiceApplication>(unwrap<ApiResponse<any>>(response));
    },

    async show(id: number) {
      const response = await api.get(`/admin/service-applications/${id}`);
      return dataFrom<ServiceApplication>(unwrap<ApiResponse<ServiceApplication>>(response));
    },

    async update(id: number, payload: Partial<ServiceApplication>) {
      const response = await api.put(`/admin/service-applications/${id}`, payload);
      return dataFrom<ServiceApplication>(unwrap<ApiResponse<ServiceApplication>>(response));
    },

    async remove(id: number) {
      const response = await api.delete(`/admin/service-applications/${id}`);
      return unwrap<ApiResponse<null>>(response);
    },
  },

  officer: {
    async queue() {
      const response = await api.get("/officer/applications/queue");
      return listFrom<ServiceApplication>(unwrap<ApiResponse<any>>(response));
    },

    async show(id: number) {
      const response = await api.get(`/officer/applications/${id}`);
      return dataFrom<ServiceApplication>(unwrap<ApiResponse<ServiceApplication>>(response));
    },

    async action(id: number, action: "approve" | "reject" | "return" | "complete", remark?: string) {
      const response = await api.post(`/officer/applications/${id}/${action}`, { remark });
      return dataFrom<ServiceApplication>(unwrap<ApiResponse<ServiceApplication>>(response));
    },

    certificateUrl(id: number) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";
      return `${baseUrl}/officer/applications/${id}/certificate`;
    },
  },

  applications: {
    async list() {
      const response = await api.get("/applications");
      return listFrom<Application>(unwrap<ApiResponse<any>>(response));
    },

    async show(id: number) {
      const response = await api.get(`/applications/${id}`);
      return dataFrom<Application>(unwrap<ApiResponse<Application>>(response));
    },

    async create(payload: Partial<Application>) {
      const response = await api.post("/applications", payload);
      return dataFrom<Application>(unwrap<ApiResponse<Application>>(response));
    },

    async update(id: number, payload: Partial<Application>) {
      const response = await api.put(`/applications/${id}`, payload);
      return dataFrom<Application>(unwrap<ApiResponse<Application>>(response));
    },

    async remove(id: number) {
      const response = await api.delete(`/applications/${id}`);
      return unwrap<ApiResponse<null>>(response);
    },
  },

  dashboard: {
    async summary() {
      const response = await api.get("/admin/applications/summary");
      return dataFrom<ApplicationSummary>(unwrap<ApiResponse<ApplicationSummary>>(response));
    },
  },
};
