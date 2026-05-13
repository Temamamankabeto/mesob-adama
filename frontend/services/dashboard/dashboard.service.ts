import api, { unwrap } from "@/lib/api";

export type DashboardCard = {
  key: string;
  label: string;
  value: number | string;
  description: string;
};

export type DashboardResponse = {
  profile: {
    id: number;
    name: string;
    role: string;
    role_label: string;
    location_level?: string | null;
    scope_label?: string | null;
    city?: string | null;
    subcity?: string | null;
    woreda?: string | null;
  };
  permissions: string[];
  cards: DashboardCard[];
  status_counts: Record<string, number>;
  quick_links: Array<{
    label: string;
    href: string;
    permission: string;
  }>;
};

export const dashboardService = {
  async getOverview(): Promise<DashboardResponse> {
    const response = await api.get("/admin/dashboard");
    const body = unwrap<{ data: DashboardResponse }>(response);

    return body.data;
  },
};
