import api, { unwrap } from "@/lib/api";

import {
  AssignWindowPayload,
  ServiceWithWindowsResponse,
} from "@/types/service-window/service-window";

export const serviceWindowService = {

  /**
   * Assign windows to service
   */
  async assign(
    serviceId: number,
    payload: AssignWindowPayload
  ): Promise<ServiceWithWindowsResponse> {

    const response = await api.post(
      `/services/${serviceId}/windows`,
      payload
    );

    return unwrap<ServiceWithWindowsResponse>(
      response
    );
  },

  /**
   * Get assigned windows by service
   */
  async getByService(
    serviceId: number
  ): Promise<ServiceWithWindowsResponse> {

    const response = await api.get(
      `/services/${serviceId}/windows`
    );

    return unwrap<ServiceWithWindowsResponse>(
      response
    );
  },
};