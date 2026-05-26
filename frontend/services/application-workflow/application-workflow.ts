<<<<<<< HEAD
// Merge these methods into applicationWorkflowService if you want custom manager UI.
export const managerWorkflowEndpoints = {
  queue: '/manager/applications/queue',
  show: (id: number) => `/manager/applications/${id}`,
  assignOfficer: (id: number) => `/manager/applications/${id}/assign-officer`,
  returnToOfficer: (id: number) => `/manager/applications/${id}/return-to-officer`,
  escalateUp: (id: number) => `/manager/applications/${id}/escalate-up`,
};
=======
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

export type OfficerWorkflowAction =
  | "accept"
  | "appointment"
  | "share"
  | "share-to-officer"
  | "return"
  | "forward-to-back-officer"
  | "approve"
  | "reject"
  | "complete"
  | "escalate-to-manager";

export type OfficerActionPayload = {
  remark?: string;
  note?: string;
  reason?: string;
  message?: string;
  priority?: "emergency" | "high" | "normal" | "low";
  officer_id?: number;
  to_officer_id?: number;
  back_officer_id?: number;
  front_officer_id?: number;
  window_id?: number;
  to_window_id?: number;
  manager_id?: number;
  appointment_at?: string;
  appointment_date?: string;
  appointment_time?: string;
  appointment_location?: string;
  location?: string;
  documents?: File[];
};

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

function actionPayload(payload: OfficerActionPayload = {}) {
  const hasFiles = Boolean(payload.documents?.length);

  const plain: Record<string, unknown> = {
    remark: payload.remark,
    note: payload.note ?? payload.remark,
    reason: payload.reason,
    message: payload.message,
    priority: payload.priority,
    officer_id: payload.officer_id,
    to_officer_id: payload.to_officer_id,
    back_officer_id: payload.back_officer_id,
    front_officer_id: payload.front_officer_id,
    window_id: payload.window_id,
    to_window_id: payload.to_window_id,
    manager_id: payload.manager_id,
    appointment_at: payload.appointment_at,
    appointment_date: payload.appointment_date,
    appointment_time: payload.appointment_time,
    appointment_location: payload.appointment_location,
    location: payload.location,
  };

  if (!hasFiles) return plain;

  const form = new FormData();

  Object.entries(plain).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      form.append(key, String(value));
    }
  });

  payload.documents?.forEach((file, index) => {
    form.append(`documents[${index}]`, file);
  });

  return form;
}

function actionConfig(payload: OfficerActionPayload = {}) {
  return payload.documents?.length
    ? {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    : undefined;
}

>>>>>>> a70d7379f653b971c5d56277ba4866695c88fe59
export const applicationWorkflowService = {
 

  officer: {
    certificateUrl(id: number) {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "/api";

      return `${baseUrl}/officer/applications/${id}/certificate`;
    },

    async queue() {
      return [];
    },

    async show(id: number) {
      return null;
    },

    async action() {
      return null;
    },

<<<<<<< HEAD
    async backOfficerAction() {
      return null;
=======
    async backOfficerAction(id: number, action: "approve" | "reject" | "return" | "share" | "escalate-to-manager", payload: OfficerActionPayload = {}) {
      const response = await api.post(
        `/officer/applications/${id}/${action}`,
        actionPayload(payload),
        actionConfig(payload)
      );

      return dataFrom<ServiceApplication>(unwrap<ApiResponse<ServiceApplication>>(response));
>>>>>>> a70d7379f653b971c5d56277ba4866695c88fe59
    },

    async frontOfficers() {
      return [];
    },
  },

  manager: {
    async queue() {
      return [];
    },

    async show() {
      return null;
    },

    async action() {
      return null;
    },
  },

  applications: {
    async list() {
      return [];
    },

    async show() {
      return null;
    },
  },

  dashboard: {
    async summary() {
      return {};
    },
  },

  forms: {},
  steps: {},
  sections: {},
  fields: {},
  conditions: {},
  builder: {},
  serviceApplications: {},
};