import api, { unwrap } from "@/lib/api";

import {
  Service,
  ServicePayload,
  ServiceListResponse,

  AssignWindowPayload,
  ServiceWithWindowsResponse,

  ServiceFormResponse,
  SingleServiceFormResponse,
  CreateServiceFormPayload,
  ServiceForm,

  CreateServiceFormFieldPayload,
  ServiceFormField,

  AssignUserServicePayload,
  UserServiceAssignmentResponse,

  PublicServiceResponse,
  FeaturedServiceResponse,
  SinglePublicServiceResponse,

  WindowGroupResponse,
} from "@/types/services/service";

/*
|--------------------------------------------------------------------------
| SERVICE
|--------------------------------------------------------------------------
*/

export const serviceService = {

  async getAll(
    page = 1
  ): Promise<ServiceListResponse> {

    const response = await api.get(
      `/services?page=${page}`
    );

    return unwrap<ServiceListResponse>(
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
| SERVICE WINDOW
|--------------------------------------------------------------------------
*/

export const serviceWindowService = {

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

/*
|--------------------------------------------------------------------------
| SERVICE FORM FIELD
|--------------------------------------------------------------------------
*/

export const serviceFormFieldService = {

  async getAll() {

    const response = await api.get(
      "/admin/service-form-fields"
    );

    return unwrap(response);
  },

  async create(
    payload: CreateServiceFormFieldPayload
  ): Promise<ServiceFormField> {

    const response = await api.post(
      "/admin/service-form-fields",
      payload
    );

    const data = unwrap<{
      success: boolean;
      message: string;
      data: ServiceFormField;
    }>(response);

    return data.data;
  },

  async update(
    id: number,
    payload: Partial<CreateServiceFormFieldPayload>
  ): Promise<ServiceFormField> {

    const response = await api.put(
      `/admin/service-form-fields/${id}`,
      payload
    );

    const data = unwrap<{
      success: boolean;
      message: string;
      data: ServiceFormField;
    }>(response);

    return data.data;
  },

  async delete(
    id: number
  ): Promise<void> {

    await api.delete(
      `/admin/service-form-fields/${id}`
    );
  },
};

/*
|--------------------------------------------------------------------------
| SERVICE FORM
|--------------------------------------------------------------------------
*/

export const serviceFormService = {

  async getAll(): Promise<ServiceFormResponse> {

    const response = await api.get(
      "/admin/service-forms"
    );

    return unwrap<ServiceFormResponse>(
      response
    );
  },

  async getOne(
    id: number
  ): Promise<SingleServiceFormResponse> {

    const response = await api.get(
      `/admin/service-forms/${id}`
    );

    return unwrap<SingleServiceFormResponse>(
      response
    );
  },

  async create(
    payload: CreateServiceFormPayload
  ): Promise<ServiceForm> {

    const response = await api.post(
      "/admin/service-forms",
      payload
    );

    const data = unwrap<{
      success: boolean;
      message: string;
      data: ServiceForm;
    }>(response);

    return data.data;
  },

  async update(
    id: number,
    payload: Partial<CreateServiceFormPayload>
  ): Promise<ServiceForm> {

    const response = await api.put(
      `/admin/service-forms/${id}`,
      payload
    );

    const data = unwrap<{
      success: boolean;
      message: string;
      data: ServiceForm;
    }>(response);

    return data.data;
  },

  async delete(
    id: number
  ): Promise<void> {

    await api.delete(
      `/admin/service-forms/${id}`
    );
  },
};

/*
|--------------------------------------------------------------------------
| USER SERVICE ASSIGNMENT
|--------------------------------------------------------------------------
*/

export const userServiceAssignmentService = {

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
| PUBLIC SERVICES
|--------------------------------------------------------------------------
*/

export const publicServiceService = {

  async getAll(
    page = 1,
    search = ""
  ): Promise<PublicServiceResponse> {

    const response = await api.get(
      "/public/services",
      {
        params: {
          page,
          search,
          per_page: 12,
        },
      }
    );

    return unwrap<PublicServiceResponse>(
      response
    );
  },

  async featured(): Promise<FeaturedServiceResponse> {

    const response = await api.get(
      "/public/services/featured"
    );

    return unwrap<FeaturedServiceResponse>(
      response
    );
  },

  async show(
    id: number
  ): Promise<SinglePublicServiceResponse> {

    const response = await api.get(
      `/public/services/${id}`
    );

    return unwrap<SinglePublicServiceResponse>(
      response
    );
  },

  async windowServices(): Promise<WindowGroupResponse> {

    const response = await api.get(
      "/public/window-services"
    );

    return unwrap<WindowGroupResponse>(
      response
    );
  },
};