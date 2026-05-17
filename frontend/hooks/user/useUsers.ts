"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

/**
 * =========================
 * TYPES
 * =========================
 */
export type UserFilters = {
  page?: number;
  search?: string;
  role?: string;

  // 🔥 LOCATION STARTS FROM SUBCITY
  subcity?: string;
  woreda?: string;
};

/**
 * =========================
 * GET USERS (FILTER SAFE)
 * =========================
 */
export const useUsers = (filters: UserFilters) => {
  return useQuery({
    queryKey: ["users", filters],

    queryFn: async () => {
      const res = await api.get("/admin/users", {
        params: {
          page: filters.page ?? 1,

          // 🔍 SEARCH (email / phone)
          search: filters.search ?? "",

          // 👤 ROLE FILTER
          role: filters.role ?? "",

          // 🏙️ SUBCITY (START POINT)
          subcity: filters.subcity ?? "",

          // 📍 WOREDA (DEPENDENT ON SUBCITY)
          woreda: filters.woreda ?? "",
        },
      });

      // 🔥 SAFE RESPONSE (NO CRASH EVER)
      return res?.data ?? { data: [], meta: {} };
    },

    // smooth pagination (React Query v5)
    placeholderData: (prev) => prev,
  });
};

/**
 * =========================
 * CREATE USER
 * =========================
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/admin/users", data);
      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

/**
 * =========================
 * UPDATE USER
 * =========================
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await api.put(`/admin/users/${id}`, data);
      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

/**
 * =========================
 * DELETE USER
 * =========================
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/admin/users/${id}`);
      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

/**
 * =========================
 * TOGGLE USER STATUS
 * =========================
 */
export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.patch(`/admin/users/${id}/toggle-status`);
      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};