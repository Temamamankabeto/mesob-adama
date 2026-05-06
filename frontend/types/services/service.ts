export type ServiceAvailability =
  | "city"
  | "subcity"
  | "woreda";

export type ServiceStatus =
  | "active"
  | "inactive";

export interface Service {
  id: number;

  name: string;

  description?: string | null;

  has_back_officer: boolean;

  service_fee: number;

  availability: ServiceAvailability[];

  status: ServiceStatus;

  created_at: string;

  updated_at: string;
}

export interface ServicePayload {
  name: string;

  description?: string;

  has_back_officer: boolean;

  service_fee: number;

  availability: ServiceAvailability[];

  status: ServiceStatus;
}

export interface PaginatedServiceResponse {
  success: boolean;

  message: string;

  data: {
    current_page: number;

    data: Service[];

    last_page: number;

    per_page: number;

    total: number;
  };
}