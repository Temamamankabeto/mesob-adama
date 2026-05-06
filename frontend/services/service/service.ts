import api, { unwrap } from "@/lib/api";

import {
  PaginatedServiceResponse,
  Service,
  ServicePayload,
} from "@/types/services/service";

export const serviceService = {
  async getAll(
    page = 1
  ): Promise<PaginatedServiceResponse> {
    const response = await api.get(
      `/services?page=${page}`
    );

    return unwrap<PaginatedServiceResponse>(
      response
    );
  },

  async create(
    payload: ServicePayload
  ): Promise<Service> {
    const response = await api.post(
      "/services",
      payload
    );

    const data = unwrap<{
      success: boolean;
      message: string;
      data: Service;
    }>(response);

    return data.data;
  },

  async update(
    id: number,
    payload: Partial<ServicePayload>
  ): Promise<Service> {
    const response = await api.put(
      `/services/${id}`,
      payload
    );

    const data = unwrap<{
      success: boolean;
      message: string;
      data: Service;
    }>(response);

    return data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/services/${id}`);
  },
};