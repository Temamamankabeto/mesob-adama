import api, { unwrap } from "@/lib/api";

import {
  AssignUserServicePayload,
  CreateServiceFormPayload,
  OfficerListResponse,
  PaginatedServiceResponse,
  Service,
  ServiceFormResponse,
  ServicePayload,
  SingleServiceFormResponse,
  UpdateServiceFormPayload,
  UserServiceAssignmentResponse,
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

  async delete(
    id: number
  ): Promise<void> {

    await api.delete(
      `/services/${id}`
    );
  },
};



/*
|--------------------------------------------------------------------------
| USER SERVICE ASSIGNMENT
|--------------------------------------------------------------------------
*/

export const userServiceAssignmentService = {

  /*
  |--------------------------------------------------------------------------
  | GET OFFICERS
  |--------------------------------------------------------------------------
  */

  async getOfficers(params?: {
    page?: number;
    search?: string;
    per_page?: number;
  }): Promise<OfficerListResponse> {

    const response = await api.get(
      "/service-officers",
      {
        params,
      }
    );

    return unwrap<OfficerListResponse>(
      response
    );
  },

  /*
  |--------------------------------------------------------------------------
  | ASSIGN SERVICES
  |--------------------------------------------------------------------------
  */

  async assign(
    userId: number,
    payload: AssignUserServicePayload
  ): Promise<UserServiceAssignmentResponse> {

    const response = await api.post(
      `/users/${userId}/services`,
      payload
    );

    return unwrap<UserServiceAssignmentResponse>(
      response
    );
  },

  /*
  |--------------------------------------------------------------------------
  | GET ASSIGNED SERVICES
  |--------------------------------------------------------------------------
  */

  async getByUser(
    userId: number
  ): Promise<UserServiceAssignmentResponse> {

    const response = await api.get(
      `/users/${userId}/services`
    );

    return unwrap<UserServiceAssignmentResponse>(
      response
    );
  },
};

/*
|--------------------------------------------------------------------------
| SERVICE FORM SERVICE
|--------------------------------------------------------------------------
*/
 
export const serviceFormService = {

  /*
  |--------------------------------------------------------------------------
  | GET ALL
  |--------------------------------------------------------------------------
  */

  async getAll(
    serviceId: number,
    params?: {
      page?: number;
      search?: string;
      per_page?: number;
    }
  ): Promise<ServiceFormResponse> {

    const response = await api.get(
      `/services/${serviceId}/forms`,
      {
        params,
      }
    );

    return unwrap<ServiceFormResponse>(
      response
    );
  },

  /*
  |--------------------------------------------------------------------------
  | GET ONE
  |--------------------------------------------------------------------------
  */

  async getOne(
    id: number
  ): Promise<SingleServiceFormResponse> {

    const response = await api.get(
      `/service-forms/${id}`
    );

    return unwrap<SingleServiceFormResponse>(
      response
    );
  },

  /*
  |--------------------------------------------------------------------------
  | CREATE
  |--------------------------------------------------------------------------
  */

  async create(
    serviceId: number,
    payload: CreateServiceFormPayload
  ): Promise<SingleServiceFormResponse> {

    const response = await api.post(
      `/services/${serviceId}/forms`,
      payload
    );

    return unwrap<SingleServiceFormResponse>(
      response
    );
  },

  /*
  |--------------------------------------------------------------------------
  | UPDATE
  |--------------------------------------------------------------------------
  */

  async update(
    id: number,
    payload: UpdateServiceFormPayload
  ): Promise<SingleServiceFormResponse> {

    const response = await api.put(
      `/service-forms/${id}`,
      payload
    );

    return unwrap<SingleServiceFormResponse>(
      response
    );
  },

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  async delete(
    id: number
  ): Promise<void> {

    await api.delete(
      `/service-forms/${id}`
    );
  },

  /*
  |--------------------------------------------------------------------------
  | TOGGLE STATUS
  |--------------------------------------------------------------------------
  */

  async toggle(
    id: number
  ): Promise<SingleServiceFormResponse> {

    const response = await api.patch(
      `/service-forms/${id}/toggle`
    );

    return unwrap<SingleServiceFormResponse>(
      response
    );
  },
};