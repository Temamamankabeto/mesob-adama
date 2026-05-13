import api, { unwrap } from "@/lib/api";

function appendApplicationData(payload: FormData, values: Record<string, unknown>, files: Record<string, File | null>) {
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => payload.append(`data[${key}][]`, String(item)));
      return;
    }

    payload.append(`data[${key}]`, String(value));
  });

  Object.entries(files).forEach(([key, file]) => {
    if (file) payload.append(`files[${key}]`, file);
  });
}

export const applicationService = {
  async getForm(serviceId: number) {
    const response = await api.get(`/public/services/${serviceId}/form`);

    return unwrap(response);
  },

  async apply(serviceId: number, valuesOrFormData: FormData | Record<string, unknown>, files: Record<string, File | null> = {}) {
    const payload = valuesOrFormData instanceof FormData ? valuesOrFormData : new FormData();

    if (!(valuesOrFormData instanceof FormData)) {
      appendApplicationData(payload, valuesOrFormData, files);
    }

    const response = await api.post(`/public/services/${serviceId}/apply`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return unwrap(response);
  },

  async track(payload: { tracking_number?: string; application_number?: string }) {
    const response = await api.post("/public/track-application", {
      tracking_number: payload.tracking_number ?? payload.application_number,
    });

    return unwrap(response);
  },
};
