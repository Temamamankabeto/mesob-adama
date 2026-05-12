import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  serviceFormSectionService,
} from "@/services/service-form-section";

import {
  ServiceFormSectionPayload,
} from "@/types/service-form-section";

export function useServiceFormSections() {
  return useQuery({
    queryKey: ["service-form-sections"],
    queryFn: () =>
      serviceFormSectionService.getAll(),
  });
}

export function useCreateServiceFormSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: ServiceFormSectionPayload
    ) =>
      serviceFormSectionService.create(
        payload
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "service-form-sections",
        ],
      });
    },
  });
}
