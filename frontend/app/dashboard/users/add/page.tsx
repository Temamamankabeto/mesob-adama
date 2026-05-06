"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useCreateUser } from "@/hooks/user/useUsers";
import { useCities } from "@/hooks/location/useCities";
import { useSubcities } from "@/hooks/location/useSubcities";
import { useWoredas } from "@/hooks/location/useWoredas";
import { useRoles } from "@/hooks/roles/useRoles";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ================= TYPE ================= */
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

/* ================= PASSWORD ================= */
const checkPassword = (password: string) => {
  const min8 = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const score = [min8, hasUpper, hasSpecial].filter(Boolean).length;

  return {
    valid: score === 3,
    percent: (score / 3) * 100,
  };
};

export default function AddUserPage() {
  const router = useRouter();
  const createUser = useCreateUser();

  const { data: citiesData } = useCities(1);
  const { data: subcitiesData } = useSubcities(1);
  const { data: woredasData } = useWoredas(1);
  const { roles: rolesData } = useRoles(1);

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

  const passwordState = useMemo(
    () => checkPassword(form.password),
    [form.password]
  );

  const canSubmit =
    form.name &&
    form.email &&
    form.phone &&
    form.role &&
    form.password === form.confirm_password &&
    passwordState.valid;

  const reset = () => {
    setForm({
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

    toast.info("Form reset");
  };

  const handleSubmit = () => {
    const roleName = roles.find((r: any) => r.id == form.role)?.name;

    createUser.mutate(
      {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        date_of_birth: form.date_of_birth,
        address: form.address,
        gender: form.gender || undefined,
        role: roleName,
        city_id: form.city_id || undefined,
        subcity_id: form.subcity_id || undefined,
        woreda_id: form.woreda_id || undefined,
      },
      {
        onSuccess: () => {
          toast.success("User created successfully 🚀");
          router.push("/dashboard/users");
        },
        onError: () => {
          toast.error("Failed to create user");
        },
      }
    );
  };

  return (
    <div className="p-6 w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create User</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4">

          <Input placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Input placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <Input placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <Input type="password" placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <Input type="password" placeholder="Confirm Password"
            value={form.confirm_password}
            onChange={(e) =>
              setForm({ ...form, confirm_password: e.target.value })
            }
          />

          <Input type="date"
            value={form.date_of_birth}
            onChange={(e) =>
              setForm({ ...form, date_of_birth: e.target.value })
            }
          />

          <Input placeholder="Address"
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
          />

          {/* GENDER */}
          <select
            className="border p-2"
            value={form.gender}
            onChange={(e) =>
              setForm({ ...form, gender: e.target.value as any })
            }
          >
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          {/* ROLE */}
          <select
            className="border p-2"
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
          <select className="border p-2"
            value={form.city_id}
            onChange={(e) =>
              setForm({ ...form, city_id: Number(e.target.value) })
            }
          >
            <option>City</option>
            {cities.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* SUBCITY */}
          <select className="border p-2"
            value={form.subcity_id}
            onChange={(e) =>
              setForm({ ...form, subcity_id: Number(e.target.value) })
            }
          >
            <option>Subcity</option>
            {subcities.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* WOREDA */}
          <select className="border p-2 col-span-2"
            value={form.woreda_id}
            onChange={(e) =>
              setForm({ ...form, woreda_id: Number(e.target.value) })
            }
          >
            <option>Woreda</option>
            {woredas.map((w: any) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>

        </CardContent>

        {/* FOOTER */}
        <div className="p-4 border-t space-y-3">

          {/* PASSWORD PROGRESS */}
          <div className="h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-green-500 rounded transition-all"
              style={{ width: `${passwordState.percent}%` }}
            />
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={reset}>
              Reset
            </Button>

            <Button disabled={!canSubmit} onClick={handleSubmit}>
              Create User
            </Button>
          </div>

        </div>
      </Card>
    </div>
  );
}