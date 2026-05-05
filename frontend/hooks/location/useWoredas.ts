"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWoredas,
  createWoreda,
  updateWoreda,
  deleteWoreda,
} from "@/services/locations/service";

/* ================= LIST ================= */
export const useWoredas = (page: number = 1) =>
  useQuery({
    queryKey: ["woredas", page],
    queryFn: () => getWoredas(page),
  });

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