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

/* ================= GET ALL CITIES ================= */

export const useCities = () => {
  return useQuery({
    queryKey: ["cities"],

    queryFn: async () => {
      const res = await getCities();

      console.log("Cities Response:", res);

      // FIX RESPONSE STRUCTURE HERE
      return res?.data?.data || res?.data || [];
    },

    staleTime: 1000 * 60 * 5,
  });
};

/* ================= CREATE CITY ================= */

export const useCreateCity = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CityPayload) => createCity(data),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["cities"],
      });
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
      qc.invalidateQueries({
        queryKey: ["cities"],
      });
    },
  });
};

/* ================= DELETE CITY ================= */

export const useDeleteCity = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCity(id),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["cities"],
      });
    },
  });
};