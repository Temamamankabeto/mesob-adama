import api, { unwrap } from "@/lib/api";
import { ServiceApplication } from "@/types/application-workflow";

export type CustomerApplicationListResponse = {
  success: boolean;
  message: string;
  data: ServiceApplication[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};

export const customerApplicationService = {
  async list(params: {
    page?: number;
    search?: string;
    status?: string;
  } = {}): Promise<CustomerApplicationListResponse> {
    const response = await api.get("/customer/service-applications", {
      params: {
        page: params.page ?? 1,
        search: params.search || undefined,
        status: params.status || undefined,
        per_page: 10,
      },
    });

    return unwrap<CustomerApplicationListResponse>(response);
  },

  async show(id: number): Promise<ServiceApplication> {
    const response = await api.get(`/customer/service-applications/${id}`);
    const body = unwrap<{ data: ServiceApplication }>(response);

    return body.data;
  },
};
