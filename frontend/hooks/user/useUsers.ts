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
  subcity?: string;
  woreda?: string;
};

/**
 * =========================
 * GET USERS (FIXED)
 * =========================
 */
export const useUsers = (filters: UserFilters) => {
  const {
    page = 1,
    search = "",
    role = "",
    subcity = "",
    woreda = "",
  } = filters;

  return useQuery({
    queryKey: ["users", page, search, role, subcity, woreda],

    queryFn: async () => {
      const res = await api.get("/admin/users", {
        params: {
          page,
          search,
          role,
          subcity,
          woreda,
        },
      });

      return res?.data ?? { data: [], meta: {} };
    },

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
 * TOGGLE STATUS
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