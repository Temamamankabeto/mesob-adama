"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWoredas,
  createWoreda,
  updateWoreda,
  deleteWoreda,
} from "@/services/locations/service";
import api from "@/lib/api";

/* ================= LIST ================= */
export const useWoredas = () => {
  return useQuery({
    queryKey: ["woredas"],

    queryFn: async () => {
      const res = await getWoredas();

      console.log("Woredas Response:", res);

      return res?.data?.data || res?.data || [];
    },

    staleTime: 1000 * 60 * 5,
  });
};
export const useWoredasWithSubcity = (subcityId?: string) => {
  return useQuery({
    queryKey: ["woredas", subcityId],

    queryFn: async () => {
      if (!subcityId) return [];

      const res = await api.get("/admin/woredas", {
        params: { subcity_id: subcityId },
      });

      // 🔥 FORCE ARRAY RETURN
      return Array.isArray(res?.data)
        ? res.data
        : res?.data?.data ?? [];
    },

    enabled: !!subcityId,
  });
};
/* ================= CREATE ================= */
export const useCreateWoreda = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createWoreda,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["woredas"] }),
  });
};



/* ================= UPDATE ================= */
export const useUpdateWoreda = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: any) => updateWoreda(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["woredas"] }),
  });
};

/* ================= DELETE ================= */
export const useDeleteWoreda = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteWoreda,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["woredas"] }),
  });
};