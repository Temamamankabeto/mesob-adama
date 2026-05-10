import api from "@/lib/api";

export const applicationService = {

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
