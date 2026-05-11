import api from "@/lib/api";
import { ServiceFormPayload } from "@/types/service-form/service-form";
export const ServiceFormAPI = {
  list: async () => (await api.get("/service-forms")).data,

  show: async (id: number) =>
    (await api.get(`/service-forms/${id}`)).data,

  create: async (payload: ServiceFormPayload) =>
    (await api.post("/service-forms", payload)).data,

  update: async (id: number, payload: ServiceFormPayload) =>
    (await api.put(`/service-forms/${id}`, payload)).data,

  remove: async (id: number) =>
    (await api.delete(`/service-forms/${id}`)).data,
};