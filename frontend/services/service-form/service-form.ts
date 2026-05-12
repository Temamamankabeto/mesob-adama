import api from "@/lib/api";

import {
  ServiceForm,
  ServiceFormPayload,
} from "@/types/service-form/service-form";

export const ServiceFormAPI = {
  /*
  |--------------------------------------------------------------------------
  | LIST
  |--------------------------------------------------------------------------
  */
  list: async (): Promise<ServiceForm[]> => {
    const response = await api.get("/service-forms");

    return Array.isArray(response.data?.data)
      ? response.data.data
      : [];
  },

  /*
  |--------------------------------------------------------------------------
  | SHOW
  |--------------------------------------------------------------------------
  */
  show: async (
    id: number
  ): Promise<ServiceForm> => {
    const response = await api.get(
      `/service-forms/${id}`
    );

    return response.data.data;
  },

  /*
  |--------------------------------------------------------------------------
  | CREATE
  |--------------------------------------------------------------------------
  */
  create: async (
    payload: ServiceFormPayload
  ): Promise<ServiceForm> => {
    const response = await api.post(
      "/service-forms",
      payload
    );

    return response.data.data;
  },

  /*
  |--------------------------------------------------------------------------
  | UPDATE
  |--------------------------------------------------------------------------
  */
  update: async (
    id: number,
    payload: ServiceFormPayload
  ): Promise<ServiceForm> => {
    const response = await api.put(
      `/service-forms/${id}`,
      payload
    );

    return response.data.data;
  },

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */
  remove: async (
    id: number
  ): Promise<void> => {
    await api.delete(`/service-forms/${id}`);
  },
};
