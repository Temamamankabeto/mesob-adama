"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSubcities,
  createSubcity,
  updateSubcity,
  deleteSubcity,
} from "@/services/locations/service";

export const useSubcities = () => {
  return useQuery({
    queryKey: ["subcities"],

    queryFn: async () => {
      const res = await getSubcities();

      console.log("Subcities Response:", res);

      return res?.data?.data || res?.data || [];
    },

    staleTime: 1000 * 60 * 5,
  });
};
// CREATE
export const useCreateSubcity = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createSubcity,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["subcities"] }),
  });
};

// UPDATE
export const useUpdateSubcity = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: any) => updateSubcity(id, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["subcities"] }),
  });
};

// DELETE
export const useDeleteSubcity = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteSubcity,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["subcities"] }),
  });
};