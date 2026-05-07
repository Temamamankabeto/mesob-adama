export interface PublicWindow {
  id: number;
  name: string;
  availability: string[];
}

export interface PublicService {
  id: number;
  name: string;
  description?: string | null;
  service_fee: number;
  availability: string[];
  has_back_officer: boolean;
  status: string;
  windows?: PublicWindow[];
  created_at: string;
  updated_at: string;
}

export interface PublicServiceResponse {
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: PublicService[];
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface FeaturedServiceResponse {
  success: boolean;
  message: string;
  data: PublicService[];
}

export interface SinglePublicServiceResponse {
  success: boolean;
  message: string;
  data: PublicService;
}