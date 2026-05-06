export interface ServiceWindowPivot {
  step_order: number;

  is_required: boolean;
}

export interface ServiceWindowItem {
  id: number;

  name: string;

  pivot: ServiceWindowPivot;
}

export interface AssignWindowPayload {
  windows: {
    window_id: number;

    step_order: number;

    is_required: boolean;
  }[];
}

export interface ServiceWithWindowsResponse {
  success: boolean;

  message: string;

  data: {
    id: number;

    name: string;

    windows: ServiceWindowItem[];
  };
}