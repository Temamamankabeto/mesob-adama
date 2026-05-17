"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  serviceFormService,
  serviceService,
  userServiceAssignmentService,
} from "@/services/service/service";

import {
  AssignUserServicePayload,
  CreateServiceFormPayload,
  ServicePayload,
  UpdateServiceFormPayload,
} from "@/types/services/service";

export function useServices(page = 1) {
  return useQuery({
    queryKey: ["services", page],
    queryFn: () => serviceService.getAll(page),
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ServicePayload) => serviceService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ServicePayload> }) =>
      serviceService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => serviceService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useServiceOfficers(params?: {
  page?: number;
  search?: string;
  per_page?: number;
  level?: "city" | "subcity" | "woreda";
  subcity_id?: number | string;
  woreda_id?: number | string;
  role?: "front_officer" | "back_officer" | "";
}) {
  return useQuery({
    queryKey: ["service-officers", params],
    queryFn: () => userServiceAssignmentService.getOfficers(params),
  });
}

export function useUserAssignedServices(userId?: number) {
  return useQuery({
    queryKey: ["user-services", userId],
    queryFn: () => userServiceAssignmentService.getByUser(userId!),
    enabled: !!userId,
  });
}

export function useAssignUserServices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: AssignUserServicePayload }) =>
      userServiceAssignmentService.assign(userId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["service-officers"] });
      queryClient.invalidateQueries({ queryKey: ["user-services", variables.userId] });
    },
  });
}

export function useServiceForms(
  serviceId?: number,
  params?: { page?: number; search?: string; per_page?: number }
) {
  return useQuery({
    queryKey: ["service-forms", serviceId, params],
    queryFn: () => serviceFormService.getAll(serviceId!, params),
    enabled: !!serviceId,
  });
}

export function useServiceForm(id?: number) {
  return useQuery({
    queryKey: ["service-form", id],
    queryFn: () => serviceFormService.getOne(id!),
    enabled: !!id,
  });
}

export function useCreateServiceForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, payload }: { serviceId: number; payload: CreateServiceFormPayload }) =>
      serviceFormService.create(serviceId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["service-forms"] }),
  });
}

export function useUpdateServiceForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateServiceFormPayload }) =>
      serviceFormService.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["service-forms"] });
      queryClient.invalidateQueries({ queryKey: ["service-form", data.data.id] });
    },
  });
}

export function useDeleteServiceForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => serviceFormService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["service-forms"] }),
  });
}

export function useToggleServiceForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => serviceFormService.toggle(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["service-forms"] });
      queryClient.invalidateQueries({ queryKey: ["service-form", data.data.id] });
    },
  });
}
