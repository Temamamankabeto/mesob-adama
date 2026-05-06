import api, { unwrap } from "@/lib/api";
import type { ServiceRequestItem, ServiceRequestListParams } from "@/types/service-management/service-request.type";

const cleanParams = (params: Record<string, unknown> = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""));

export const serviceRequestService = {
  async list(params: ServiceRequestListParams = {}) {
    const response = await api.get("/admin/service-requests", { params: cleanParams(params) });
    return response.data;
  },
  async show(id: number | string) {
    const response = await api.get(`/admin/service-requests/${id}`);
    return unwrap<{ data: ServiceRequestItem }>(response).data;
  },
  async create(payload: Partial<ServiceRequestItem>) {
    const response = await api.post("/admin/service-requests", payload);
    return unwrap<{ data: ServiceRequestItem }>(response).data;
  },
  async update(id: number | string, payload: Partial<ServiceRequestItem>) {
    const response = await api.put(`/admin/service-requests/${id}`, payload);
    return unwrap<{ data: ServiceRequestItem }>(response).data;
  },
};
