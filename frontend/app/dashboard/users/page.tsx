"use client";

import { useState } from "react";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "@/hooks/user/useUsers";

import { useCities } from "@/hooks/location/useCities";
import { useSubcities } from "@/hooks/location/useSubcities";
import { useWoredas } from "@/hooks/location/useWoredas";
import { useRoles } from "@/hooks/roles/useRoles";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ================= TYPES ================= */
type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  city_id?: number;
  subcity_id?: number;
  woreda_id?: number;
  role_id?: number;
};

export default function UsersPage() {
  const [page, setPage] = useState(1);

  /* ================= USERS ================= */
  const { data } = useUsers(page);
  const users: User[] = data?.data || [];
  const meta = data?.meta;

  /* ================= LOCATION DATA (FIXED) ================= */
  const { data: citiesData } = useCities(1);
  const { data: subcitiesData } = useSubcities(1);
  const { data: woredasData } = useWoredas(1);
  const { data: rolesData } = useRoles(1);

  // 🔥 FIX: ALWAYS extract .data
  const cities = citiesData?.data || [];
  const subcities = subcitiesData?.data || [];
  const woredas = woredasData?.data || [];
  const roles = rolesData?.data || [];

  /* ================= MUTATIONS ================= */
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  /* ================= UI STATE ================= */
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  const [form, setForm] = useState<any>({
    name: "",
    email: "",
    phone: "",
    gender: "",
    role_id: "",
    city_id: "",
    subcity_id: "",
    woreda_id: "",
  });

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      gender: "",
      role_id: "",
      city_id: "",
      subcity_id: "",
      woreda_id: "",
    });
  };

  const handleCreate = () => {
    createUser.mutate(form, {
      onSuccess: () => {
        setCreateOpen(false);
        resetForm();
      },
    });
  };

  const handleUpdate = () => {
    if (!editUser) return;

    updateUser.mutate(
      { id: editUser.id, data: form },
      {
        onSuccess: () => {
          setEditUser(null);
          resetForm();
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete user?")) deleteUser.mutate(id);
  };

  return (
    <div className="p-6 space-y-4">

      {/* HEADER */}
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button onClick={() => setCreateOpen(true)}>+ Add User</Button>
      </div>

      {/* TABLE */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.id}</TableCell>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.role_id}</TableCell>
              <TableCell>{u.city_id}</TableCell>

              <TableCell className="relative">
                <Button
                  variant="ghost"
                  onClick={() =>
                    setOpenMenuId(openMenuId === u.id ? null : u.id)
                  }
                >
                  ⋮
                </Button>

                {openMenuId === u.id && (
                  <div className="absolute right-0 bg-white border shadow z-50">
                    <button
                      className="block px-3 py-2 w-full text-left"
                      onClick={() => {
                        setEditUser(u);
                        setForm(u);
                        setOpenMenuId(null);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="block px-3 py-2 w-full text-left text-red-600"
                      onClick={() => handleDelete(u.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* PAGINATION */}
      <div className="flex gap-2">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </Button>
        <span>Page {meta?.current_page}</span>
        <Button onClick={() => setPage(page + 1)}>Next</Button>
      </div>

      {/* ================= MODAL ================= */}
      {(createOpen || editUser) && (
        <Modal
          title={editUser ? "Edit User" : "Create User"}
          onClose={() => {
            setCreateOpen(false);
            setEditUser(null);
          }}
        >
          {/* INPUTS */}
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          {/* GENDER */}
          <select
            className="border w-full p-2"
            value={form.gender}
            onChange={(e) =>
              setForm({ ...form, gender: e.target.value })
            }
          >
            <option value="">Select Gender</option>
            <option value="male">male</option>
            <option value="female">female</option>
          </select>

          {/* ROLE */}
          <select
            className="border w-full p-2"
            value={form.role_id}
            onChange={(e) =>
              setForm({ ...form, role_id: e.target.value })
            }
          >
            <option value="">Select Role</option>
            {roles.map((r: any) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          {/* CITY */}
          <select
            className="border w-full p-2"
            value={form.city_id}
            onChange={(e) =>
              setForm({ ...form, city_id: e.target.value })
            }
          >
            <option value="">Select City</option>
            {cities.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* SUBCITY */}
          <select
            className="border w-full p-2"
            value={form.subcity_id}
            onChange={(e) =>
              setForm({ ...form, subcity_id: e.target.value })
            }
          >
            <option value="">Select SubCity</option>
            {subcities.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* WOREDA */}
          <select
            className="border w-full p-2"
            value={form.woreda_id}
            onChange={(e) =>
              setForm({ ...form, woreda_id: e.target.value })
            }
          >
            <option value="">Select Woreda</option>
            {woredas.map((w: any) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          <div className="flex justify-end">
            <Button onClick={editUser ? handleUpdate : handleCreate}>
              {editUser ? "Update" : "Save"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ================= MODAL ================= */
function Modal({ title, children, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 w-[500px] rounded space-y-3">
        <div className="flex justify-between">
          <h2 className="font-bold">{title}</h2>
          <button onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}