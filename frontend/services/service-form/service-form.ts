import api, { unwrap } from "@/lib/api";

export const serviceFormService = {
  async getAll() {
    const response = await api.get(
      "/service-forms"
    );

    return unwrap(response);
  },

  async getOne(id: number) {
    const response = await api.get(
      `/service-forms/${id}`
    );

    return unwrap(response);
  },

  async create(payload: any) {
    const response = await api.post(
      "/service-forms",
      payload
    );

    return unwrap(response);  
  },

  async update(
    id: number,
    payload: any
  ) {
    const response = await api.put(
      `/service-forms/${id}`,
      payload
    );

    return unwrap(response);
  },

  async delete(id: number) {
    const response = await api.delete(
      `/service-forms/${id}`
    );

    return unwrap(response);
  },
};