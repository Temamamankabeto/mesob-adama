import api, { unwrap } from "@/lib/api";

export const officerApplicationService = {
  async queue() {
    const response = await api.get(
      "/officer/applications/queue"
    );

    return unwrap(response);
  },

  async show(id: number) {
    const response = await api.get(
      `/officer/applications/${id}`
    );

    return unwrap(response);
  },

  async approve(
    id: number,
    payload: any
  ) {
    const response = await api.post(
      `/officer/applications/${id}/approve`,
      payload
    );

    return unwrap(response);
  },

  async reject(
    id: number,
    payload: any
  ) {
    const response = await api.post(
      `/officer/applications/${id}/reject`,
      payload
    );

    return unwrap(response);
  },

  async returnApplication(
    id: number,
    payload: any
  ) {
    const response = await api.post(
      `/officer/applications/${id}/return`,
      payload
    );

    return unwrap(response);
  },

  async complete(
    id: number,
    payload: any
  ) {
    const response = await api.post(
      `/officer/applications/${id}/complete`,
      payload
    );

    return unwrap(response);
  },
};