import api from "@/lib/api";

import {
  ServiceFormSectionPayload,
} from "@/types/service-form-section";

export const serviceFormSectionService = {
  async getAll() {
    const response = await api.get(
      "/service-form-sections"
    );

    return response.data;
  },

  async create(
    payload: ServiceFormSectionPayload
  ) {
    const response = await api.post(
      "/service-form-sections",
      payload
    );

    return response.data;
  },
};
