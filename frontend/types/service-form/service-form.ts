export interface ServiceForm {
  id: number;
  service_id: number;
  title: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface ServiceFormResponse {
  success: boolean;
  message: string;
  data: {
    data: ServiceForm[];
  };
}

export interface SingleServiceFormResponse {
  success: boolean;
  message: string;
  data: ServiceForm;
}

export interface CreateServiceFormPayload {
  service_id: number;
  title: string;
  description?: string;
  is_active?: boolean;
}