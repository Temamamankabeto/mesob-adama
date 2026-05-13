// ============================================================
// FILE: services/home/home.ts
// ============================================================

import api, { unwrap } from "@/lib/api";

import {
  HomepageResponse,
  TrackApplicationPayload,
  TrackApplicationResponse,
} from "@/types/home/home";

export const homeService = {
  async getHomepage(): Promise<HomepageResponse> {
    const response = await api.get("/public/homepage");

    return unwrap<HomepageResponse>(response);
  },

  async trackApplication(payload: TrackApplicationPayload): Promise<TrackApplicationResponse> {
    const response = await api.post("/public/track-application", {
      tracking_number: (payload as any).tracking_number ?? (payload as any).application_number,
    });

    return unwrap<TrackApplicationResponse>(response);
  },
};
