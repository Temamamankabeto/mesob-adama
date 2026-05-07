export interface WindowGroupedService {

  id: number;

  name: string;

  service_fee: number;

  availability: string[];
}

export interface WindowGroup {

  id: number;

  name: string;

  availability: string[];

  services: WindowGroupedService[];
}

export interface WindowGroupResponse {

  success: boolean;

  message: string;

  data: WindowGroup[];
}