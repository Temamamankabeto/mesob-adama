"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

// GET USERS
export const useUsers = (page = 1, search = "") => {
  return useQuery({
    queryKey: ["users", page, search],
    queryFn: async () => {
      const res = await api.get(
        `/admin/users?page=${page}&search=${search}`
      );

      return res.data;
    },
  });
};

// CREATE
export const useCreateUser = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.post("/admin/users", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
};

// UPDATE
export const useUpdateUser = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: any) =>
      api.put(`/admin/users/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
};

// DELETE
export const useDeleteUser = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(`/admin/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
};