// ============================================================
// FILE: hooks/home/use-home.ts
// ============================================================

"use client";

import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import { homeService } from "@/services/home/home";

import { TrackApplicationPayload } from "@/types/home/home";

/**
 * Homepage
 */
export function useHomepage() {

  return useQuery({

    queryKey: ["homepage"],

    queryFn: () =>
      homeService.getHomepage(),
  });
}

/**
 * Track application
 */
export function useTrackApplication() {

  return useMutation({

    mutationFn: (
      payload:
        TrackApplicationPayload
    ) =>
      homeService.trackApplication(
        payload
      ),
  });
}