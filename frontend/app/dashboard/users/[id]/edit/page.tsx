"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { useUsers, useUpdateUser } from "@/hooks/user/useUsers";
import { useCities } from "@/hooks/location/useCities";
import { useSubcities } from "@/hooks/location/useSubcities";
import { useWoredas } from "@/hooks/location/useWoredas";
import { useRoles } from "@/hooks/roles/useRoles";

import {
  getRoleOption,
  locationLevelFromIds,
  LOCATION_LEVELS,
  LocationLevel,
  roleLabel,
} from "@/config/roles.config";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Form = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  date_of_birth: string;
  address: string;
  gender: "male" | "female" | "other" | "";
  role: string;
  location_level: LocationLevel;
  city_id: string;
  subcity_id: string;
  woreda_id: string;
};

export default function EditUserPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data } = useUsers(1);
  const updateUser = useUpdateUser();

  const users = data?.data || [];
  const user = users.find((u: any) => String(u.id) === String(id));

  const { data: citiesData } = useCities();
  const { data: subcitiesData } = useSubcities();
  const { data: woredasData } = useWoredas();
  const { roles } = useRoles();

  const cities = citiesData?.data || [];
  const subcities = subcitiesData?.data || [];
  const woredas = woredasData?.data || [];

  const [form, setForm] = useState<Form>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    date_of_birth: "",
    address: "",
    gender: "",
    role: "",
    location_level: "",
    city_id: "",
    subcity_id: "",
    woreda_id: "",
  });

  const selectedRole = useMemo(() => getRoleOption(form.role), [form.role]);

  /* =========================
     FIX: PROPER CASCADING
  ========================= */

  const filteredSubcities = useMemo(() => {
    if (!form.city_id) return [];
    return subcities.filter(
      (s: any) => String(s.city_id) === String(form.city_id)
    );
  }, [subcities, form.city_id]);

  const filteredWoredas = useMemo(() => {
    if (!form.subcity_id) return [];
    return woredas.filter(
      (w: any) => String(w.subcity_id) === String(form.subcity_id)
    );
  }, [woredas, form.subcity_id]);

  const requiresCity =
    selectedRole.isScoped &&
    ["city", "subcity", "woreda"].includes(form.location_level);

  const requiresSubcity =
    selectedRole.isScoped &&
    ["subcity", "woreda"].includes(form.location_level);

  const requiresWoreda =
    selectedRole.isScoped &&
    form.location_level === "woreda";

  /* =========================
     LOAD USER (FIXED)
  ========================= */
  useEffect(() => {
    if (!user) return;

    const roleName =
      user.role ||
      user.role_names?.[0] ||
      user.roles?.[0]?.name ||
      "";

    const role = getRoleOption(roleName);

    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      confirm_password: "",
      date_of_birth: user.date_of_birth || "",
      address: user.address || "",
      gender: user.gender || "",
      role: roleName,

      location_level: role.isScoped
        ? locationLevelFromIds(
            user.city_id,
            user.subcity_id,
            user.woreda_id
          ) || "city"
        : "",

      city_id: user.city_id ? String(user.city_id) : "",
      subcity_id: user.subcity_id ? String(user.subcity_id) : "",
      woreda_id: user.woreda_id ? String(user.woreda_id) : "",
    });
  }, [user]);

  /* =========================
     UPDATE
  ========================= */
  function handleUpdate() {
    if (!form.role) {
      toast.error("Role required");
      return;
    }

    updateUser.mutate(
      {
        id: Number(id),
        data: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address || undefined,
          date_of_birth: form.date_of_birth || undefined,
          gender: form.gender || undefined,
          role: form.role,
          location_level: selectedRole.isScoped
            ? form.location_level
            : undefined,
          city_id: requiresCity ? Number(form.city_id) : undefined,
          subcity_id: requiresSubcity ? Number(form.subcity_id) : undefined,
          woreda_id: requiresWoreda ? Number(form.woreda_id) : undefined,
          ...(form.password ? { password: form.password } : {}),
        },
      },
      {
        onSuccess: () => {
          toast.success("User updated");
          router.push("/dashboard/users");
        },
        onError: (err: any) => {
          toast.error(err?.message || "Update failed");
        },
      }
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Edit User</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit User</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* NAME */}
          <Input
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            placeholder="Name"
          />

          {/* EMAIL */}
          <Input
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            placeholder="Email"
          />

          {/* ROLE */}
          <select
            className="border p-2 rounded"
            value={form.role}
            onChange={(e) => {
              const role = getRoleOption(e.target.value);

              setForm({
                ...form,
                role: e.target.value,
                location_level: role.isScoped ? "city" : "",
                city_id: "",
                subcity_id: "",
                woreda_id: "",
              });
            }}
          >
            <option value="">Select Role</option>
            {roles.map((r: any) => (
              <option key={r.id} value={r.name}>
                {r.label || roleLabel(r.name)}
              </option>
            ))}
          </select>

          {/* LEVEL */}
          {selectedRole.isScoped && (
            <select
              className="border p-2 rounded"
              value={form.location_level}
              onChange={(e) =>
                setForm({
                  ...form,
                  location_level: e.target.value as LocationLevel,
                  city_id: "",
                  subcity_id: "",
                  woreda_id: "",
                })
              }
            >
              {LOCATION_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          )}

          {/* CITY */}
          {requiresCity && (
            <select
              className="border p-2 rounded"
              value={form.city_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  city_id: e.target.value,
                  subcity_id: "",
                  woreda_id: "",
                })
              }
            >
              <option value="">City</option>
              {cities.map((c: any) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {/* SUBCITY */}
          {requiresSubcity && (
            <select
              className="border p-2 rounded"
              value={form.subcity_id}
              disabled={!form.city_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  subcity_id: e.target.value,
                  woreda_id: "",
                })
              }
            >
              <option value="">Subcity</option>
              {filteredSubcities.map((s: any) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          {/* WOREDA */}
          {requiresWoreda && (
            <select
              className="border p-2 rounded"
              value={form.woreda_id}
              disabled={!form.subcity_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  woreda_id: e.target.value,
                })
              }
            >
              <option value="">Woreda</option>
              {filteredWoredas.map((w: any) => (
                <option key={w.id} value={String(w.id)}>
                  {w.name}
                </option>
              ))}
            </select>
          )}

          {/* PASSWORD */}
          <Input
            type="password"
            placeholder="New Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <Input
            type="password"
            placeholder="Confirm Password"
            value={form.confirm_password}
            onChange={(e) =>
              setForm({
                ...form,
                confirm_password: e.target.value,
              })
            }
          />
        </CardContent>

        <div className="flex justify-end p-4 border-t">
          <Button onClick={handleUpdate}>
            Update User
          </Button>
        </div>
      </Card>
    </div>
  );
}