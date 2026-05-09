import api, { unwrap } from "@/lib/api";

export const applicationService = {
  async getForm(serviceId: number) {
    const response = await api.get(
      `/public/services/${serviceId}/form`
    );

    return unwrap(response);
  },

  async apply(
    serviceId: number,
    payload: FormData
  ) {
    const response = await api.post(
      `/public/services/${serviceId}/apply`,
      payload,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    return unwrap(response);
  },

  async track(payload: any) {
    const response = await api.post(
      "/public/track-application",
      payload
    );

    return unwrap(response);
  },
};