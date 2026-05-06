"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCities,
  createCity,
  updateCity,
  deleteCity,
} from "@/services/locations/service";

/* ================= TYPES ================= */
type CityPayload = {
  name: string;
  code?: string;
};

type UpdateCityPayload = {
  id: number;
  data: CityPayload;
};

/* ================= GET CITIES ================= */
export const useCities = (page: number) => {
  return useQuery({
    queryKey: ["cities", page],
    queryFn: async () => {
      const res = await getCities(page);

      // ✅ NORMALIZE RESPONSE (VERY IMPORTANT FIX)
      return {
        data: res?.data ?? [],
        meta: res?.meta ?? {},
      };
    },

    // React Query v5 replacement for keepPreviousData
    placeholderData: (prev) => prev,

    staleTime: 1000 * 60 * 5,
  });
};

/* ================= CREATE CITY ================= */
export const useCreateCity = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CityPayload) => createCity(data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cities"] });
    },
  });
};

/* ================= UPDATE CITY ================= */
export const useUpdateCity = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateCityPayload) =>
      updateCity(id, data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cities"] });
    },
  });
};

/* ================= DELETE CITY ================= */
export const useDeleteCity = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCity(id),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cities"] });
    },
  });
};