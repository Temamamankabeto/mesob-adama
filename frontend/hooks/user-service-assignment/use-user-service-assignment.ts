// ============================================================
// FILE: hooks/user-service-assignment/use-user-service-assignment.ts
// ============================================================

"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { userServiceAssignmentService } from "@/services/user-service-assignment/user-service-assignment";

import { AssignUserServicePayload } from "@/types/user-service-assignment/user-service-assignment";

/**
 * Get assigned services
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

/**
 * Assign services
 */
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
        queryKey: ["users"],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "user-services",
          variables.userId,
        ],
      });
    },
  });
}