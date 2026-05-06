"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from "@/services/roles/service";

// =====================
// GET ROLES (FIXED)
// =====================
export const useRoles = (page: number, perPage = 10, search = "") => {
  return useQuery({
    queryKey: ["roles", page, perPage, search],
    queryFn: async () => {
      const res = await getRoles(page, perPage, search);

      // ✅ FIX: always return array
      return res.data?.data ?? [];
    },
  });
};

// =====================
// CREATE
// =====================
export const useCreateRole = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createRole,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  });
};

// =====================
// UPDATE
// =====================
export const useUpdateRole = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: any) => updateRole(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  });
};

// =====================
// DELETE
// =====================
export const useDeleteRole = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  });
};