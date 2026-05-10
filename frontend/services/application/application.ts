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



  async getDashboardStats() {
    const res = await api.get(
      "/dashboard/application-stats"
    );

    return res.data;
  },

  async getApplicationSummary() {
    const res = await api.get(
      "/reports/application-summary"
    );

    return res.data;
  },

  async getMyApplications() {
    const res = await api.get(
      "/applications"
    );

    return res.data;
  },
};



// officer application will be able to see the application details and update the status of the application

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

 