"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { useUser, useUpdateUser } from "@/hooks/user/useUsers";
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
  date_of_birth: string;
  address: string;
  gender: "male" | "female" | "other" | "";
  role: string;
  location_level: LocationLevel;
  city_id: number | "";
  subcity_id: number | "";
  woreda_id: number | "";
};

const initialForm: Form = {
  name: "",
  email: "",
  phone: "",
  date_of_birth: "",
  address: "",
  gender: "",
  role: "",
  location_level: "",
  city_id: "",
  subcity_id: "",
  woreda_id: "",
};

function listFrom(value: any) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
}

export default function EditUserPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data, isLoading } = useUser(String(id));
  const updateUser = useUpdateUser();

  const user = data?.data || data;

  const { data: citiesRaw } = useCities();
  const { data: subcitiesRaw } = useSubcities();
  const { data: woredasRaw } = useWoredas();
  const { roles } = useRoles();

  const cities = listFrom(citiesRaw);
  const subcities = listFrom(subcitiesRaw);
  const woredas = listFrom(woredasRaw);

  const [form, setForm] = useState<Form>(initialForm);

  const selectedRole = useMemo(() => getRoleOption(form.role), [form.role]);

  const filteredSubcities = subcities.filter((subcity: any) => {
    return Number(subcity.city_id) === Number(form.city_id);
  });

  const filteredWoredas = woredas.filter((woreda: any) => {
    return Number(woreda.subcity_id) === Number(form.subcity_id);
  });

  const requiresCity =
    selectedRole.isScoped &&
    ["city", "subcity", "woreda"].includes(form.location_level);

  const requiresSubcity =
    selectedRole.isScoped &&
    ["subcity", "woreda"].includes(form.location_level);

  const requiresWoreda =
    selectedRole.isScoped && form.location_level === "woreda";

  function buildForm(source: any): Form {
    const roleName =
      source?.role ||
      source?.role_names?.[0] ||
      source?.roles?.[0]?.name ||
      "";

    const role = getRoleOption(roleName);

    return {
      name: source?.name || "",
      email: source?.email || "",
      phone: source?.phone || "",
      date_of_birth: source?.date_of_birth || "",
      address: source?.address || "",
      gender: source?.gender || "",
      role: roleName,
      location_level: role.isScoped
        ? source?.location_level ||
          locationLevelFromIds(source?.city_id, source?.subcity_id, source?.woreda_id) ||
          "city"
        : "",
      city_id: source?.city_id || "",
      subcity_id: source?.subcity_id || "",
      woreda_id: source?.woreda_id || "",
    };
  }

  useEffect(() => {
    if (!user?.id) return;
    setForm(buildForm(user));
  }, [user?.id]);

  function reset() {
    if (!user?.id) return;
    setForm(buildForm(user));
  }

  function validate() {
    if (!form.name.trim()) return toast.error("Name is required"), false;
    if (!form.email.trim()) return toast.error("Email is required"), false;
    if (!form.phone.trim()) return toast.error("Phone is required"), false;
    if (!form.role) return toast.error("Role is required"), false;

    if (selectedRole.isScoped && !form.location_level) {
      return toast.error("Location level is required for this role"), false;
    }

    if (requiresCity && !form.city_id) {
      return toast.error("City is required for this level"), false;
    }

    if (requiresSubcity && !form.subcity_id) {
      return toast.error("Subcity is required for this level"), false;
    }

    if (requiresWoreda && !form.woreda_id) {
      return toast.error("Woreda is required for this level"), false;
    }

    return true;
  }

  function handleUpdate() {
    if (!validate()) return;

    updateUser.mutate(
      {
        id: Number(id),
        data: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address || undefined,
          date_of_birth: form.date_of_birth || undefined,
          gender: form.gender || undefined,
          role: form.role,
          location_level: selectedRole.isScoped ? form.location_level : undefined,
          city_id: requiresCity ? form.city_id : undefined,
          subcity_id: requiresSubcity ? form.subcity_id : undefined,
          woreda_id: requiresWoreda ? form.woreda_id : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("User updated successfully");
          router.push("/dashboard/users");
        },
        onError: (error: any) => {
          const errors = error?.response?.data?.errors;
          if (errors) {
            const first = Object.values(errors)?.[0] as any;
            toast.error(Array.isArray(first) ? first[0] : "Validation failed");
            return;
          }

          toast.error(error?.response?.data?.message || error?.message || "Failed to update user");
        },
      }
    );
  }

  if (isLoading) {
    return <div className="p-6">Loading user...</div>;
  }

  if (!user?.id) {
    return <div className="p-6 text-muted-foreground">User not found.</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit User</h1>
          <p className="text-sm text-muted-foreground">
            Update user identity, role, and location scope. Password is managed separately from profile.
          </p>
        </div>

        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Update User Information</CardTitle>
          <p className="text-sm text-muted-foreground">
            Role controls responsibility. Location level controls where the user can work.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              placeholder="Name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />

            <Input
              placeholder="Email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />

            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
            />

            <Input
              placeholder="Date of Birth"
              type="date"
              value={form.date_of_birth}
              onChange={(event) => setForm({ ...form, date_of_birth: event.target.value })}
            />

            <Input
              placeholder="Address"
              value={form.address}
              onChange={(event) => setForm({ ...form, address: event.target.value })}
            />

            <select
              className="rounded border bg-background p-2"
              value={form.gender}
              onChange={(event) => setForm({ ...form, gender: event.target.value as any })}
            >
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <select
              className="rounded border bg-background p-2"
              value={form.role}
              onChange={(event) => {
                const role = getRoleOption(event.target.value);

                setForm({
                  ...form,
                  role: event.target.value,
                  location_level: role.isScoped ? "city" : "",
                  city_id: "",
                  subcity_id: "",
                  woreda_id: "",
                });
              }}
            >
              <option value="">Role</option>
              {roles.map((role: any) => (
                <option key={role.id || role.name} value={role.name}>
                  {role.label || roleLabel(role.name)}
                </option>
              ))}
            </select>

            {selectedRole.isScoped && (
              <select
                className="rounded border bg-background p-2"
                value={form.location_level}
                onChange={(event) =>
                  setForm({
                    ...form,
                    location_level: event.target.value as LocationLevel,
                    city_id: "",
                    subcity_id: "",
                    woreda_id: "",
                  })
                }
              >
                <option value="">Location Level</option>
                {LOCATION_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            )}

            {requiresCity && (
              <select
                className="rounded border bg-background p-2"
                value={form.city_id}
                onChange={(event) =>
                  setForm({
                    ...form,
                    city_id: event.target.value ? Number(event.target.value) : "",
                    subcity_id: "",
                    woreda_id: "",
                  })
                }
              >
                <option value="">City *</option>
                {cities.map((city: any) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            )}

            {requiresSubcity && (
              <select
                className="rounded border bg-background p-2"
                value={form.subcity_id}
                disabled={!form.city_id}
                onChange={(event) =>
                  setForm({
                    ...form,
                    subcity_id: event.target.value ? Number(event.target.value) : "",
                    woreda_id: "",
                  })
                }
              >
                <option value="">Subcity *</option>
                {filteredSubcities.map((subcity: any) => (
                  <option key={subcity.id} value={subcity.id}>
                    {subcity.name}
                  </option>
                ))}
              </select>
            )}

            {requiresWoreda && (
              <select
                className="rounded border bg-background p-2"
                value={form.woreda_id}
                disabled={!form.subcity_id}
                onChange={(event) =>
                  setForm({
                    ...form,
                    woreda_id: event.target.value ? Number(event.target.value) : "",
                  })
                }
              >
                <option value="">Woreda *</option>
                {filteredWoredas.map((woreda: any) => (
                  <option key={woreda.id} value={woreda.id}>
                    {woreda.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
            Password is not updated here. Users can reset their own password from My Profile after login.
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={reset}>
              Reset
            </Button>

            <Button onClick={handleUpdate} disabled={updateUser.isPending}>
              {updateUser.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
