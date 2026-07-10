"use client";

import { useQuery } from "@tanstack/react-query";

import {
  reportingDashboardService,
  type ReportingDashboardParams,
} from "@/services/dashboard/reporting-dashboard.service";

export function useReportingDashboard(params: ReportingDashboardParams) {
  return useQuery({
    queryKey: ["reporting-dashboard", params],
    queryFn: () => reportingDashboardService.get(params),
  });
}
