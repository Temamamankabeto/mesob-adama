"use client";

import { useEffect, useState } from "react";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from "@/services/roles/service";
import { Role } from "@/types/roles/type";

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = async (page = 1) => {
    try {
      setLoading(true);

      const res = await getRoles(page);

      // 🔥 FIXED HERE
      setRoles(res.roles || []);
      setMeta(res.meta || null);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addRole = async (name: string) => {
    await createRole(name);
    fetchRoles();
  };

  const editRole = async (id: number, name: string) => {
    await updateRole(id, name);
    fetchRoles();
  };

  const removeRole = async (id: number) => {
    await deleteRole(id);
    fetchRoles();
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return {
    roles,
    meta,
    loading,
    error,
    fetchRoles,
    addRole,
    editRole,
    removeRole,
  };
};