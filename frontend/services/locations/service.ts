import api from "@/lib/api";

// ================= CITIES =================
export const getCities = async (page = 1) => {
  const res = await api.get(`/admin/cities?page=${page}`);
  return res.data.data;
};

export const createCity = async (data: any) => {
  const res = await api.post(`/admin/cities`, data);
  return res.data.data;
};

export const updateCity = async (id: number, data: any) => {
  const res = await api.put(`/admin/cities/${id}`, data);
  return res.data.data;
};

export const deleteCity = async (id: number) => {
  const res = await api.delete(`/admin/cities/${id}`);
  return res.data;
};

// ================= SUBCITIES =================
export const getSubcities = async (page = 1) => {
  const res = await api.get(`/admin/subcities?page=${page}`);
  return res.data.data;
};

export const createSubcity = async (data: any) => {
  const res = await api.post(`/admin/subcities`, data);
  return res.data.data;
};

export const updateSubcity = async (id: number, data: any) => {
  const res = await api.put(`/admin/subcities/${id}`, data);
  return res.data.data;
};

export const deleteSubcity = async (id: number) => {
  const res = await api.delete(`/admin/subcities/${id}`);
  return res.data;
};

// ================= WOREDAS =================
export const getWoredas = async (page = 1) => {
  const res = await api.get(`/admin/woredas?page=${page}`);
  return res.data.data;
};

export const createWoreda = async (data: any) => {
  const res = await api.post(`/admin/woredas`, data);
  return res.data.data;
};

export const updateWoreda = async (id: number, data: any) => {
  const res = await api.put(`/admin/woredas/${id}`, data);
  return res.data.data;
};

export const deleteWoreda = async (id: number) => {
  const res = await api.delete(`/admin/woredas/${id}`);
  return res.data;
};