"use client";

import api, { unwrap } from "@/lib/api";
import type { ServiceApplication } from "@/types/application-workflow";

export type ApiResponse<T> = { success: boolean; message?: string; data: T; meta?: any };

export type OfficerWorkflowAction =
  | "accept"
  | "share"
  | "share-to-officer"
  | "return"
  | "forward-to-back-officer"
  | "approve"
  | "reject"
  | "complete"
  | "escalate-to-manager";

export type ManagerWorkflowAction = "assign-officer" | "return-to-officer" | "escalate-up";

export type OfficerActionPayload = {
  remark?: string;
  note?: string;
  reason?: string;
  description?: string;
  officer_id?: number;
  to_officer_id?: number;
  back_officer_id?: number;
  front_officer_id?: number;
  window_id?: number;
  to_window_id?: number;
  manager_id?: number;
  documents?: File[];
};

export type ManagerActionPayload = {
  note?: string;
  remark?: string;
  reason?: string;
  officer_id?: number;
  window_id?: number;
  manager_id?: number;
  documents?: File[];
};

function params(input?: Record<string, unknown>) {
  return {
    params: Object.fromEntries(
      Object.entries(input || {}).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ),
  };
}

function listFrom<T>(body: any): T[] {
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.data?.data)) return body.data.data;
  if (Array.isArray(body)) return body;
  return [];
}

function dataFrom<T>(body: any): T {
  return body?.data ?? body;
}

function actionPayload(payload: OfficerActionPayload = {}) {
  const hasFiles = payload.documents?.length;

  if (!hasFiles) {
    return {
      remark: payload.remark,
      note: payload.note ?? payload.remark,
      reason: payload.reason,
      description: payload.description,
      officer_id: payload.officer_id,
      to_officer_id: payload.to_officer_id,
      back_officer_id: payload.back_officer_id,
      front_officer_id: payload.front_officer_id,
      window_id: payload.window_id,
      to_window_id: payload.to_window_id,
      manager_id: payload.manager_id,
    };
  }

  const form = new FormData();

  if (payload.remark) form.append("remark", payload.remark);
  if (payload.note) form.append("note", payload.note);
  if (payload.reason) form.append("reason", payload.reason);
  if (payload.description) form.append("description", payload.description);
  if (payload.officer_id) form.append("officer_id", String(payload.officer_id));
  if (payload.to_officer_id) form.append("to_officer_id", String(payload.to_officer_id));
  if (payload.back_officer_id) form.append("back_officer_id", String(payload.back_officer_id));
  if (payload.front_officer_id) form.append("front_officer_id", String(payload.front_officer_id));
  if (payload.window_id) form.append("window_id", String(payload.window_id));
  if (payload.to_window_id) form.append("to_window_id", String(payload.to_window_id));
  if (payload.manager_id) form.append("manager_id", String(payload.manager_id));
  payload.documents?.forEach((file) => form.append("documents[]", file));

  return form;
}

function actionConfig(payload: OfficerActionPayload = {}) {
  return payload.documents?.length ? { headers: { "Content-Type": "multipart/form-data" } } : undefined;
}

export const applicationWorkflowService = {
  officer: {
    async queue(filter?: { bucket?: string; search?: string; status?: string }) {
      const response = await api.get("/officer/applications/queue", params(filter));
      return listFrom<ServiceApplication>(unwrap<ApiResponse<any>>(response));
    },

    async show(id: number) {
      const response = await api.get(`/officer/applications/${id}`);
      return dataFrom<ServiceApplication>(unwrap<ApiResponse<ServiceApplication>>(response));
    },

    async action(id: number, action: OfficerWorkflowAction, payload: OfficerActionPayload = {}) {
      if (action === "share-to-officer") {
        const response = await api.post(`/officer/applications/${id}/share-to-officer`, {
          to_window_id: payload.to_window_id ?? payload.window_id,
          to_officer_id: payload.to_officer_id ?? payload.officer_id,
          note: payload.note ?? payload.remark,
        });

        return dataFrom<ServiceApplication>(unwrap<ApiResponse<ServiceApplication>>(response));
      }

      const response = await api.post(
        `/officer/applications/${id}/${action}`,
        actionPayload(payload),
        actionConfig(payload)
      );

      return dataFrom<ServiceApplication>(unwrap<ApiResponse<ServiceApplication>>(response));
    },

    async backOfficerAction(
      id: number,
      action: "approve" | "reject" | "return" | "share" | "escalate-to-manager",
      payload: OfficerActionPayload = {}
    ) {
      const response = await api.post(
        `/officer/applications/${id}/${action}`,
        actionPayload(payload),
        actionConfig(payload)
      );

      return dataFrom<ServiceApplication>(unwrap<ApiResponse<ServiceApplication>>(response));
    },

    async sharingWindows() {
      const response = await api.get("/officer/sharing/windows");
      const body = unwrap<ApiResponse<any>>(response);
      return listFrom<{ id: number; name: string; level?: string }>(body);
    },

    async sharingOfficers(windowId: number) {
      const response = await api.get(`/officer/sharing/windows/${windowId}/officers`);
      const body = unwrap<ApiResponse<any>>(response);
      return listFrom<{ id: number; name: string; email?: string; phone?: string; role?: string; role_names?: string[] }>(body);
    },

    certificateUrl(id: number) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";
      return `${baseUrl}/officer/applications/${id}/certificate`;
    },
  },

  manager: {
    async queue(filter?: { bucket?: string; search?: string; status?: string }) {
      const response = await api.get("/manager/applications/queue", params(filter));
      return listFrom<ServiceApplication>(unwrap<ApiResponse<any>>(response));
    },

    async show(id: number) {
      const response = await api.get(`/manager/applications/${id}`);
      return dataFrom<ServiceApplication>(unwrap<ApiResponse<ServiceApplication>>(response));
    },

    async action(id: number, action: ManagerWorkflowAction, payload: ManagerActionPayload = {}) {
      const response = await api.post(
        `/manager/applications/${id}/${action}`,
        actionPayload(payload as OfficerActionPayload),
        actionConfig(payload as OfficerActionPayload)
      );

      return dataFrom<ServiceApplication>(unwrap<ApiResponse<ServiceApplication>>(response));
    },
  },
};
