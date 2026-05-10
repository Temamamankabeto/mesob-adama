import api from "@/lib/api";

export const serviceFormService = {

  async getAll() {

    const response = await api.get(
      "/admin/service-forms"
    );

    return response.data;
  },

  async create(data: any) {

    const response = await api.post(
      "/admin/service-forms",
      data
    );

    return response.data;
  },
};
