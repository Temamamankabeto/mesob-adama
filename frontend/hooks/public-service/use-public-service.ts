"use client";

import { useQuery } from "@tanstack/react-query";

import { publicServiceService } from "@/services/public-service/public-service";

/*
|--------------------------------------------------------------------------
| ALL SERVICES
|--------------------------------------------------------------------------
*/

export function usePublicServices(
  page = 1,
  search = ""
) {
  return useQuery({

    queryKey: [
      "public-services",
      page,
      search,
    ],

    queryFn: () =>
      publicServiceService.getAll(
        page,
        search
      ),
  });
}

/*
|--------------------------------------------------------------------------
| FEATURED SERVICES
|--------------------------------------------------------------------------
*/

export function useFeaturedServices() {

  return useQuery({

    queryKey: [
      "featured-public-services",
    ],

    queryFn: () =>
      publicServiceService.featured(),
  });
}

/*
|--------------------------------------------------------------------------
| SINGLE SERVICE
|--------------------------------------------------------------------------
*/

export function usePublicService(
  id: number
) {
  return useQuery({

    queryKey: [
      "public-service",
      id,
    ],

    queryFn: () =>
      publicServiceService.show(id),

    enabled: !!id,
  });
}

/*
|--------------------------------------------------------------------------
| WINDOW SERVICES
|--------------------------------------------------------------------------
*/

export function useWindowServices() {

  return useQuery({

    queryKey: [
      "window-services",
    ],

    queryFn: () =>
      publicServiceService.windowServices(),
  });
}