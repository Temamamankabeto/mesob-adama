import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { serviceFormService }
from "@/services/service-form.service";

export function useServiceForms() {

  return useQuery({

    queryKey: ["service-forms"],

    queryFn: () =>
      serviceFormService.getAll(),
  });
}

export function useCreateServiceForm() {

  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: (data: any) =>
      serviceFormService.create(data),

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["service-forms"],
      });
    },
  });
}
