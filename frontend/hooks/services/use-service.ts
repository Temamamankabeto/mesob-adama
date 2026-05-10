"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {

  publicServiceService,

  serviceFormFieldService,
  serviceFormService,

  serviceService,

  serviceWindowService,

  userServiceAssignmentService,

} from "@/services/service/service";

import {

  AssignUserServicePayload,
  AssignWindowPayload,

  CreateServiceFormFieldPayload,
  CreateServiceFormPayload,

  ServicePayload,

} from "@/types/services/service";

/*
|--------------------------------------------------------------------------
| SERVICES
|--------------------------------------------------------------------------
*/

export function useServices(
  page = 1
) {

  return useQuery({

    queryKey: [
      "services",
      page,
    ],

    queryFn: () =>
      serviceService.getAll(page),
  });
}

export function useServiceMutations() {

  const queryClient =
    useQueryClient();

  const create = useMutation({

    mutationFn: (
      payload: ServicePayload
    ) =>
      serviceService.create(payload),

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["services"],
      });
    },
  });

  const update = useMutation({

    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<ServicePayload>;
    }) =>
      serviceService.update(
        id,
        payload
      ),

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["services"],
      });
    },
  });

  const remove = useMutation({

    mutationFn: (
      id: number
    ) =>
      serviceService.delete(id),

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["services"],
      });
    },
  });

  return {
    create,
    update,
    remove,
  };
}

/*
|--------------------------------------------------------------------------
| SERVICE WINDOWS
|--------------------------------------------------------------------------
*/

export function useServiceWindows(
  serviceId?: number
) {

  return useQuery({

    queryKey: [
      "service-windows",
      serviceId,
    ],

    queryFn: () =>
      serviceWindowService.getByService(
        serviceId!
      ),

    enabled: !!serviceId,
  });
}

export function useAssignServiceWindows() {

  const queryClient =
    useQueryClient();

  return useMutation({

    mutationFn: ({
      serviceId,
      payload,
    }: {
      serviceId: number;
      payload: AssignWindowPayload;
    }) =>
      serviceWindowService.assign(
        serviceId,
        payload
      ),

    onSuccess: (
      _,
      variables
    ) => {

      queryClient.invalidateQueries({
        queryKey: [
          "service-windows",
          variables.serviceId,
        ],
      });
    },
  });
}

/*
|--------------------------------------------------------------------------
| SERVICE FORMS
|--------------------------------------------------------------------------
*/

export function useServiceForms() {

  return useQuery({

    queryKey: [
      "service-forms",
    ],

    queryFn: () =>
      serviceFormService.getAll(),
  });
}

export function useServiceFormMutations() {

  const queryClient =
    useQueryClient();

  const create = useMutation({

    mutationFn: (
      payload: CreateServiceFormPayload
    ) =>
      serviceFormService.create(
        payload
      ),

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: [
          "service-forms",
        ],
      });
    },
  });

  const update = useMutation({

    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<CreateServiceFormPayload>;
    }) =>
      serviceFormService.update(
        id,
        payload
      ),

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: [
          "service-forms",
        ],
      });
    },
  });

  const remove = useMutation({

    mutationFn: (
      id: number
    ) =>
      serviceFormService.delete(id),

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: [
          "service-forms",
        ],
      });
    },
  });

  return {
    create,
    update,
    remove,
  };
}

/*
|--------------------------------------------------------------------------
| SERVICE FORM FIELDS
|--------------------------------------------------------------------------
*/

export function useServiceFormFieldMutations() {

  const queryClient =
    useQueryClient();

  const create = useMutation({

    mutationFn: (
      payload: CreateServiceFormFieldPayload
    ) =>
      serviceFormFieldService.create(
        payload
      ),

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: [
          "service-form-fields",
        ],
      });
    },
  });

  const update = useMutation({

    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<CreateServiceFormFieldPayload>;
    }) =>
      serviceFormFieldService.update(
        id,
        payload
      ),

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: [
          "service-form-fields",
        ],
      });
    },
  });

  const remove = useMutation({

    mutationFn: (
      id: number
    ) =>
      serviceFormFieldService.delete(id),

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: [
          "service-form-fields",
        ],
      });
    },
  });

  return {
    create,
    update,
    remove,
  };
}

/*
|--------------------------------------------------------------------------
| USER SERVICE ASSIGNMENTS
|--------------------------------------------------------------------------
*/

export function useUserAssignedServices(
  userId?: number
) {

  return useQuery({

    queryKey: [
      "user-services",
      userId,
    ],

    queryFn: () =>
      userServiceAssignmentService.getByUser(
        userId!
      ),

    enabled: !!userId,
  });
}

export function useAssignUserServices() {

  const queryClient =
    useQueryClient();

  return useMutation({

    mutationFn: ({
      userId,
      payload,
    }: {
      userId: number;
      payload: AssignUserServicePayload;
    }) =>
      userServiceAssignmentService.assign(
        userId,
        payload
      ),

    onSuccess: (
      _,
      variables
    ) => {

      queryClient.invalidateQueries({
        queryKey: [
          "user-services",
          variables.userId,
        ],
      });
    },
  });
}

/*
|--------------------------------------------------------------------------
| PUBLIC SERVICES
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

export function useFeaturedServices() {

  return useQuery({

    queryKey: [
      "featured-services",
    ],

    queryFn: () =>
      publicServiceService.featured(),
  });
}

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

export function useWindowServices() {

  return useQuery({

    queryKey: [
      "window-services",
    ],

    queryFn: () =>
      publicServiceService.windowServices(),
  });
}