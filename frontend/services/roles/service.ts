import api from "@/lib/api";
import { RoleResponse } from "@/types/roles/type";

// GET
export const getRoles = async (page = 1) => {
  const res = await api.get(`/admin/roles?page=${page}`);

  return {
    roles: res.data.data,
    meta: res.data.meta,
  };
};
// CREATE
export const createRole = async (data: { name: string }) => {
  const res = await api.post(`/admin/roles`, data);
  return res.data.data;
};

// UPDATE
export const updateRole = async (id: number, data: { name: string }) => {
  const res = await api.put(`/admin/roles/${id}`, data);
  return res.data.data;
};

// DELETE
export const deleteRole = async (id: number) => {
  const res = await api.delete(`/admin/roles/${id}`);
  return res.data;
};