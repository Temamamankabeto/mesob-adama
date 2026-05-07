import api from "@/lib/api";

// GET ALL ROLES
export const getRoles = async () => {
  const res = await api.get("/admin/roles");

  return res.data.data;
};

// CREATE ROLE
export const createRole = async (data: { name: string }) => {
  const res = await api.post("/admin/roles", data);

  return res.data.data;
};

// UPDATE ROLE
export const updateRole = async (
  id: number,
  data: { name: string }
) => {
  const res = await api.put(`/admin/roles/${id}`, data);

  return res.data.data;
};

// DELETE ROLE
export const deleteRole = async (id: number) => {
  const res = await api.delete(`/admin/roles/${id}`);

  return res.data;
};