// ============================================================
// FILE: services/user-service-assignment/user-service-assignment.ts
// ============================================================

import api, { unwrap } from "@/lib/api";

import {
  AssignUserServicePayload,
  UserServiceAssignmentResponse,
} from "@/types/user-service-assignment/user-service-assignment";

export const userServiceAssignmentService = {

  /**
   * Assign services
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

  /**
   * Get assigned services
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