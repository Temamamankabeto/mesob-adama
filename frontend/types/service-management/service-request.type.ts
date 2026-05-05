export type ServiceRequestStatus = "draft" | "submitted" | "under_review" | "approved" | "returned" | "completed";

export type ServiceRequestItem = {
  id: number;
  service_name: string;
  customer_id: number;
  assigned_officer_id?: number | null;
  status: ServiceRequestStatus | string;
  data?: Record<string, unknown> | null;
  created_at?: string;
  customer?: { id: number; name: string; email: string };
  officer?: { id: number; name: string; email: string };
};

export type ServiceRequestListParams = {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
  mine?: boolean;
  assigned?: boolean;
};
