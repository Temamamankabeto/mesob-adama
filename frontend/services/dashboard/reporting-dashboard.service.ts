import api, { unwrap } from "@/lib/api";

export type DashboardCardsResponse = {
  service_cards: { total_applications: number; on_progress_applications: number; completed_applications: number };
  feedback_cards: { highly_satisfied: number; satisfied: number; dissatisfied: number };
  scope: { role: string; level?: string | null; label: string };
};

export type ReportRow = { window: string; service: string; officer: string; total: number; approved_rejected: number; on_progress: number; percent: number };
export type FeedbackRow = { window: string; service: string; highly_satisfied: number; satisfied: number; not_satisfied: number; total: number; percent: number };
export type Option = { id?: number; name?: string; label?: string; value?: string | number; subcity_id?: number };

export type ReportingDashboardResponse = {
  summary: { total_applications: number; approved_applications: number; rejected_applications: number; in_progress_applications: number };
  report: ReportRow[];
  feedback: FeedbackRow[];
  requires_filter?: boolean;
  filters: { levels: Option[]; subcities: Option[]; woredas: Option[]; times: Option[]; windows: Option[]; services: Option[]; officers: Option[]; statuses: string[] };
  scope: { role: string; level?: string | null; label: string };
};

export type ReportingDashboardParams = Record<string, string | number | undefined>;

export const reportingDashboardService = {
  async dashboard(): Promise<DashboardCardsResponse> {
    const response = await api.get("/admin/dashboard/reporting");
    const body = unwrap<{ data: DashboardCardsResponse }>(response);
    return body.data;
  },
  async report(params?: ReportingDashboardParams): Promise<ReportingDashboardResponse> {
    const response = await api.get("/admin/dashboard/reporting/report", { params });
    const body = unwrap<{ data: ReportingDashboardResponse }>(response);
    return body.data;
  },
};
