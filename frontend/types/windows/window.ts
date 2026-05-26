export type WindowAvailability =
  | "city"
  | "subcity"
  | "woreda";

export interface Window {
  id: number;

  name: string;

  availability: WindowAvailability[];

  created_at: string;

  updated_at: string;
}

export interface WindowPayload {
  name: string;

  availability: WindowAvailability[];
}

export interface PaginatedWindowResponse {
  success: boolean;

  message: string;

  data: {
    current_page: number;

    data: Window[];

    last_page: number;

    per_page: number;

    total: number;
  };
}