"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useUsers, useUpdateUser } from "@/hooks/user/useUsers";
import { useCities } from "@/hooks/location/useCities";
import { useSubcities } from "@/hooks/location/useSubcities";
import { useWoredas } from "@/hooks/location/useWoredas";
import { useRoles } from "@/hooks/roles/useRoles";

/* shadcn */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";

/* ================= TYPES ================= */
type Form = {
  name: string;
  email: string;
  phone: string;

  password: string;
  confirm_password: string;

  date_of_birth: string;
  address: string;

  gender: "male" | "female" | "";

  role: string;

  city_id: number | "";
  subcity_id: number | "";
  woreda_id: number | "";
};

export default function EditUserPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data } = useUsers(1);
  const updateUser = useUpdateUser();

  const users = data?.data || [];
  const user = users.find((u: any) => u.id == id);

  /* dropdowns */
  const { data: citiesData } = useCities(1);
  const { data: subcitiesData } = useSubcities(1);
  const { data: woredasData } = useWoredas(1);
  const { roles: rolesData } = useRoles();

  const cities = citiesData?.data || [];
  const subcities = subcitiesData?.data || [];
  const woredas = woredasData?.data || [];
  const roles = rolesData || [];

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

    city_id: "",
    subcity_id: "",
    woreda_id: "",
  });

  /* LOAD USER INTO FORM */
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",

        password: "",
        confirm_password: "",

        date_of_birth: user.date_of_birth || "",
        address: user.address || "",

        gender: user.gender || "",

        role: user.roles?.[0]?.id || "",

        city_id: user.city_id || "",
        subcity_id: user.subcity_id || "",
        woreda_id: user.woreda_id || "",
      });
    }
  }, [user]);

  /* RESET */
  const reset = () => {
    if (!user) return;
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: "",
      confirm_password: "",
      date_of_birth: user.date_of_birth || "",
      address: user.address || "",
      gender: user.gender || "",
      role: user.roles?.[0]?.id || "",
      city_id: user.city_id || "",
      subcity_id: user.subcity_id || "",
      woreda_id: user.woreda_id || "",
    });
  };

  /* VALIDATION */
  const validate = () => {
    if (form.password && form.password !== form.confirm_password) {
      toast.error("Passwords do not match");
      return false;
    }
    if (!form.role) {
      toast.error("Role is required");
      return false;
    }
    return true;
  };

  /* UPDATE */
  const handleUpdate = () => {
    if (!validate()) return;

    const roleName = roles.find((r: any) => r.id == form.role)?.name;

    updateUser.mutate(
      {
        id: Number(id),
        data: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          date_of_birth: form.date_of_birth,
          gender: form.gender || undefined,

          role: roleName,

          city_id: form.city_id || undefined,
          subcity_id: form.subcity_id || undefined,
          woreda_id: form.woreda_id || undefined,

          ...(form.password
            ? { password: form.password }
            : {}),
        },
      },
      {
        onSuccess: () => {
          toast.success("User updated successfully");
          router.push("/dashboard/users");
        },
      }
    );
  };

  return (
    <div className="p-6 space-y-6">

      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Edit User</h1>

        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Update User Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* GRID FORM */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

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

            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />

            <Input
              placeholder="Date of Birth"
              type="date"
              value={form.date_of_birth}
              onChange={(e) =>
                setForm({ ...form, date_of_birth: e.target.value })
              }
            />

            <Input
              placeholder="Address"
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
            />

            {/* ROLE */}
            <select
              className="border p-2 rounded"
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
            >
              <option value="">Role</option>
              {roles.map((r: any) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>

            {/* CITY */}
            <select
              className="border p-2 rounded"
              value={form.city_id}
              onChange={(e) =>
                setForm({ ...form, city_id: Number(e.target.value) })
              }
            >
              <option value="">City</option>
              {cities.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* SUBCITY */}
            <select
              className="border p-2 rounded"
              value={form.subcity_id}
              onChange={(e) =>
                setForm({ ...form, subcity_id: Number(e.target.value) })
              }
            >
              <option value="">Subcity</option>
              {subcities.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* WOREDA */}
            <select
              className="border p-2 rounded"
              value={form.woreda_id}
              onChange={(e) =>
                setForm({ ...form, woreda_id: Number(e.target.value) })
              }
            >
              <option value="">Woreda</option>
              {woredas.map((w: any) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>

            {/* PASSWORD */}
            <Input
              type="password"
              placeholder="New Password (optional)"
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
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={reset}>
              Reset
            </Button>

            <Button onClick={handleUpdate}>
              Update User
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}