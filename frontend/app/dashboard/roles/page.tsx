"use client";

import { useState, useEffect } from "react";
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from "@/hooks/roles/useRoles";

type Role = {
  id: number;
  name: string;
  created_at: string;
};

/* 🔥 debounce */
function useDebounce(value: string, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value]);

  return debounced;
}

export default function RolesPage() {
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const debounced = useDebounce(search);

  const { data, isLoading } = useRoles(page, 10, debounced);

  const create = useCreateRole();
  const update = useUpdateRole();
  const remove = useDeleteRole();

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const [editRole, setEditRole] = useState<Role | null>(null);
  const [editName, setEditName] = useState("");

  if (isLoading) return <p className="p-6">Loading...</p>;

  const roles = data?.data || [];
  const meta = data?.meta;

  const handleCreate = () => {
    if (!newName) return;

    create.mutate({ name: newName }, {
      onSuccess: () => {
        setNewName("");
        setCreateOpen(false);
      },
    });
  };

  const handleUpdate = () => {
    if (!editRole) return;

    update.mutate({
      id: editRole.id,
      data: { name: editName },
    });

    setEditRole(null);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete role?")) return;
    remove.mutate(id);
  };

  return (
    <div className="p-6 space-y-4">

      {/* HEADER */}
      <div className="flex justify-between">
        <h1 className="text-xl font-bold">Roles</h1>

        <div className="flex gap-2">
          <input
            className="border px-3 py-2"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

        </div>
      </div>

      {/* TABLE */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
          </tr>
        </thead>

        <tbody>
          {roles.map((r: Role) => (
            <tr key={r.id}>
              <td className="border p-2">{r.id}</td>
              <td className="border p-2">{r.name}</td>

            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="flex gap-2">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>

        <span>
          {meta?.current_page} / {meta?.last_page}
        </span>

        <button
          disabled={page === meta?.last_page}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>

    
    </div>
  );
}