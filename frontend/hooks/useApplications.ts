import { useQuery } from "@tanstack/react-query";
import { applicationService } from "@/services/application.service";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () =>
      applicationService.getDashboardStats(),
  });
}

export function useMyApplications() {
  return useQuery({
    queryKey: ["my-applications"],
    queryFn: () =>
      applicationService.getMyApplications(),
  });
}
