import api, { unwrap } from "@/lib/api";

function bodyData<T = any>(response: any): T {
  const body = unwrap<any>(response);
  return (body?.data ?? body) as T;
}

function listFrom(value: any) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  if (Array.isArray(value?.items)) return value.items;
  return [];
}

function metaFrom(value: any) {
  const data = value?.data ?? value;

  return {
    current_page: data?.current_page ?? value?.current_page ?? 1,
    last_page: data?.last_page ?? value?.last_page ?? 1,
    per_page: data?.per_page ?? value?.per_page ?? listFrom(value).length,
    total: data?.total ?? value?.total ?? listFrom(value).length,
  };
}

function formDataFromPayload(payload: any) {
  if (payload instanceof FormData) return payload;

  const source = {
    ...(payload || {}),
    ...(payload?.payload || {}),
  };

  const formData = new FormData();

  Object.entries(source).forEach(([key, value]) => {
    if (
      value === undefined ||
      value === null ||
      key === "id" ||
      key === "application_id" ||
      key === "action" ||
      key === "payload"
    ) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item instanceof File) {
          formData.append(`${key}[]`, item);
        } else {
          formData.append(`${key}[]`, String(item));
        }
      });
      return;
    }

    formData.append(key, value as any);
  });

  return formData;
}

async function postOfficerWorkflow(id: number, endpoint: string, payload: any = {}) {
  const response = await api.post(
    `/officer/applications/${id}/${endpoint}`,
    formDataFromPayload(payload),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return bodyData(response);
}

async function postManagerWorkflow(id: number, endpoint: string, payload: any = {}) {
  const response = await api.post(
    `/manager/applications/${id}/${endpoint}`,
    formDataFromPayload(payload),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return bodyData(response);
}

export const managerWorkflowEndpoints = {
  queue: "/manager/applications/queue",
  show: (id: number) => `/manager/applications/${id}`,
  assignOfficer: (id: number) => `/manager/applications/${id}/assign-officer`,
  returnToOfficer: (id: number) => `/manager/applications/${id}/return-to-officer`,
  escalateUp: (id: number) => `/manager/applications/${id}/escalate-up`,
};

export const applicationWorkflowService = {
  officer: {
    certificateUrl(id: number) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
      return `${baseUrl}/officer/applications/${id}/certificate`;
    },

    async queue(params?: Record<string, any>) {
      const response = await api.get("/officer/applications/queue", { params });
      const body = bodyData<any>(response);

      return {
        data: listFrom(body),
        meta: metaFrom(body),
      };
    },

    async show(id: number) {
      const response = await api.get(`/officer/applications/${id}`);
      return bodyData(response);
    },

    async action(payload: any) {
      const source = {
        ...(payload || {}),
        ...(payload?.payload || {}),
      };

      const id = Number(source?.id ?? source?.application_id);
      const action = String(source?.action || payload?.action || "");

      if (!id || !action) {
        throw new Error("Application id and action are required.");
      }

      const map: Record<string, string> = {
        accept: "accept",
        appointment: "appointment",
        set_appointment: "appointment",
        share: "share",
        share_to_officer: "share-to-officer",
        "share-to-officer": "share-to-officer",
        forward_to_back_officer: "forward-to-back-officer",
        "forward-to-back-officer": "forward-to-back-officer",
        approve: "approve",
        reject: "reject",
        return: "return",
        return_to_customer: "return",
        complete: "complete",
        escalate_to_manager: "escalate-to-manager",
        "escalate-to-manager": "escalate-to-manager",
      };

      const endpoint = map[action] || action.replaceAll("_", "-");

      return postOfficerWorkflow(id, endpoint, payload);
    },

    async backOfficerAction(payload: any) {
      return this.action(payload);
    },

    async sharingWindows(params?: Record<string, any>) {
      const response = await api.get("/officer/sharing/windows", { params });
      const body = bodyData(response);
      return listFrom(body);
    },

    async sharingOfficers(windowId: number | string, params?: Record<string, any>) {
      const response = await api.get(`/officer/sharing/windows/${windowId}/officers`, { params });
      const body = bodyData(response);
      return listFrom(body);
    },

    async frontOfficers(params?: Record<string, any>) {
      const response = await api.get("/officer/sharing/windows", { params });
      const body = bodyData(response);
      return listFrom(body);
    },
  },

  sharing: {
    async windows(params?: Record<string, any>) {
      const response = await api.get("/officer/sharing/windows", { params });
      const body = bodyData(response);
      return listFrom(body);
    },

    async officers(windowId: number | string, params?: Record<string, any>) {
      const response = await api.get(`/officer/sharing/windows/${windowId}/officers`, { params });
      const body = bodyData(response);
      return listFrom(body);
    },
  },

  manager: {
    async queue(params?: Record<string, any>) {
      const response = await api.get("/manager/applications/queue", { params });
      const body = bodyData<any>(response);

      return {
        data: listFrom(body),
        meta: metaFrom(body),
      };
    },

    async show(id: number) {
      const response = await api.get(`/manager/applications/${id}`);
      return bodyData(response);
    },

    async action(payload: any) {
      const id = Number(payload?.id ?? payload?.application_id);
      const action = String(payload?.action || "");

      if (!id || !action) {
        throw new Error("Application id and action are required.");
      }

      const map: Record<string, string> = {
        assign_officer: "assign-officer",
        return_to_officer: "return-to-officer",
        escalate_up: "escalate-up",
      };

      const endpoint = map[action] || action.replaceAll("_", "-");

      return postManagerWorkflow(id, endpoint, source);
    },
  },

  applications: {
    async list(params?: Record<string, any>) {
      const response = await api.get("/admin/service-applications", { params });
      return bodyData(response);
    },

    async show(id: number) {
      const response = await api.get(`/admin/service-applications/${id}`);
      return bodyData(response);
    },
  },

  dashboard: {
    async summary() {
      const response = await api.get("/admin/applications/summary");
      return bodyData(response);
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
