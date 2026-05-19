export type WindowAvailability =
  | "city"
  | "subcity"
  | "woreda";

export interface Window {
  id: number;
  name: string;
  title?: string | null;
  city_title?: string | null;
  subcity_title?: string | null;
  woreda_title?: string | null;
  administrative_level?: WindowAvailability | null;
  availability: WindowAvailability[] | { levels?: WindowAvailability[] };
  city_id?: number | null;
  subcity_id?: number | null;
  woreda_id?: number | null;
  city?: { id: number; name: string } | null;
  subcity?: { id: number; name: string; city_id?: number } | null;
  woreda?: { id: number; name: string; subcity_id?: number } | null;
  assigned_services_count?: number;
  assigned_officers_count?: number;
  created_at: string;
  updated_at: string;
}

export interface WindowPayload {
  name: string;
  availability: WindowAvailability[];
  city_title?: string | null;
  subcity_title?: string | null;
  woreda_title?: string | null;
  city_id?: number | string | null;
  subcity_id?: number | string | null;
  woreda_id?: number | string | null;
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
