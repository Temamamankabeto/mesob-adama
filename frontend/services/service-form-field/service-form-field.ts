import api, { unwrap } from "@/lib/api";

export const serviceFormFieldService = {
  async getAll() {
    const response = await api.get(
      "/admin/service-form-fields"
    );

    return unwrap(response);
  },

  async create(payload: any) {
    const response = await api.post(
      "/admin/service-form-fields",
      payload
    );

    return unwrap(response);
  },

  async update(
    id: number,
    payload: any
  ) {
    const response = await api.put(
      `/admin/service-form-fields/${id}`,
      payload
    );

    return unwrap(response);
  },

  async delete(id: number) {
    const response = await api.delete(
      `/admin/service-form-fields/${id}`
    );

    return unwrap(response);
  },
};