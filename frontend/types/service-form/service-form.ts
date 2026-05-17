export type ServiceForm = {
  id: number;
  service_id: number;
  title: string;
  description?: string | null;
  is_active?: boolean;
  service?: {
    id: number;
    name: string;
  };
};

export type ServiceFormPayload = {
  service_id: number;
  title: string;
  description?: string | null;
  is_active?: boolean;
};
