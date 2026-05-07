import api, { unwrap } from "@/lib/api";

import {
  FeaturedServiceResponse,
  PublicServiceResponse,
  SinglePublicServiceResponse,
} from "@/types/public-service/public-service";

import {
  WindowGroupResponse,
} from "@/types/public-service/window-group";

export const publicServiceService = {

  /*
  |--------------------------------------------------------------------------
  | ALL SERVICES
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | FEATURED SERVICES
  |--------------------------------------------------------------------------
  */

  async featured(): Promise<FeaturedServiceResponse> {

    const response = await api.get(
      "/public/services/featured"
    );

    return unwrap<FeaturedServiceResponse>(
      response
    );
  },

  /*
  |--------------------------------------------------------------------------
  | SINGLE SERVICE
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | GROUP SERVICES BY WINDOW
  |--------------------------------------------------------------------------
  */

  async windowServices(): Promise<WindowGroupResponse> {

    const response = await api.get(
      "/public/window-services"
    );

    return unwrap<WindowGroupResponse>(
      response
    );
  },
};