import api, { unwrap } from "@/lib/api";

export const getRoles = async (
  page = 1,
  perPage = 10,
  search = ""
) => {
  const res = await api.get(
    `/admin/roles?page=${page}&per_page=${perPage}&search=${search}`
  );
  return unwrap(res);
};

export const createRole = async (data: { name: string }) => {
  const res = await api.post("/admin/roles", data);
  return unwrap(res);
};

export const updateRole = async (
  id: number,
  data: { name: string }
) => {
  const res = await api.put(`/admin/roles/${id}`, data);
  return unwrap(res);
};

export const deleteRole = async (id: number) => {
  const res = await api.delete(`/admin/roles/${id}`);
  return unwrap(res);
};