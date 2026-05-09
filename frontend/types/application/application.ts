export interface Application {
  id: number;
  tracking_number: string;
  status: string;
  submitted_at: string;

  service: {
    id: number;
    name: string;
  };
}

export interface ApplyPayload {
  data: Record<string, any>;
  files?: Record<string, File>;
}

export interface TrackPayload {
  tracking_number: string;
}