// ============================================================
// FILE: types/user-service-assignment/user-service-assignment.ts
// ============================================================

import { Service } from "@/types/services/service";

export interface UserAssignedService {
  id: number;

  name: string;
}

export interface UserServiceAssignmentResponse {
  success: boolean;

  message: string;

  data: {
    id: number;

    name: string;

    assigned_services: UserAssignedService[];
  };
}

export interface AssignUserServicePayload {
  service_ids: number[];
}