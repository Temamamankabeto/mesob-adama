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

  /**
   * Homepage data
   */
  async getHomepage():
    Promise<HomepageResponse> {

    const response = await api.get(
      "/public/homepage"
    );

    return unwrap<HomepageResponse>(
      response
    );
  },

  /**
   * Track application
   */
  async trackApplication(
    payload: TrackApplicationPayload
  ): Promise<TrackApplicationResponse> {

    const response = await api.post(
      "/public/track-application",
      payload
    );

    return unwrap<TrackApplicationResponse>(
      response
    );
  },
};