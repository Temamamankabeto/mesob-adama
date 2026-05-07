"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useCreateUser } from "@/hooks/user/useUsers";
import { useCities } from "@/hooks/location/useCities";
import { useSubcities } from "@/hooks/location/useSubcities";
import { useWoredas } from "@/hooks/location/useWoredas";
import { useRoles } from "@/hooks/roles/useRoles";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

/* ================= PASSWORD CHECK ================= */

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
    city_id: "",
    subcity_id: "",
    woreda_id: "",
  });

  const passwordState = useMemo(
    () => checkPassword(form.password),
    [form.password]
  );

  const userLevel = useMemo(() => {
    if (form.city_id && form.subcity_id && form.woreda_id) {
      return "Woreda Level User";
    }
    if (form.city_id && form.subcity_id) {
      return "Subcity Level User";
    }
    if (form.city_id) {
      return "City Level User";
    }
    return "";
  }, [form.city_id, form.subcity_id, form.woreda_id]);

  const canSubmit =
    form.name &&
    form.email &&
    form.phone &&
    form.password &&
    form.confirm_password &&
    form.password === form.confirm_password &&
    passwordState.valid &&
    form.role &&
    form.city_id;

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
    const selectedRole = roles.find(
      (r: any) => Number(r.id) === Number(form.role)
    );

    createUser.mutate(
      {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        date_of_birth: form.date_of_birth,
        address: form.address,
        gender: form.gender || undefined,
        role: selectedRole?.name,
        city_id: form.city_id || undefined,
        subcity_id: form.subcity_id || undefined,
        woreda_id: form.woreda_id || undefined,
        level: userLevel,
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

          {/* NAME */}
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="text-sm font-medium">Phone</label>
            <Input
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="text-sm font-medium">Confirm Password</label>
            <Input
              type="password"
              value={form.confirm_password}
              onChange={(e) =>
                setForm({
                  ...form,
                  confirm_password: e.target.value,
                })
              }
            />
          </div>

          {/* DATE OF BIRTH */}
          <div>
            <label className="text-sm font-medium">Date of Birth</label>
            <Input
              type="date"
              value={form.date_of_birth}
              onChange={(e) =>
                setForm({
                  ...form,
                  date_of_birth: e.target.value,
                })
              }
            />
          </div>

          {/* ADDRESS */}
          <div>
            <label className="text-sm font-medium">Address</label>
            <Input
              value={form.address}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: e.target.value,
                })
              }
            />
          </div>

          {/* GENDER */}
          <div>
            <label className="text-sm font-medium">Gender</label>
            <select
              className="border rounded-md p-2 w-full"
              value={form.gender}
              onChange={(e) =>
                setForm({ ...form, gender: e.target.value as any })
              }
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* ROLE */}
          <div>
            <label className="text-sm font-medium">Role</label>
            <select
              className="border rounded-md p-2 w-full"
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
            >
              <option value="">Select Role</option>
              {roles?.map((role: any) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {/* CITY */}
          <div>
            <label className="text-sm font-medium">City *</label>
            <select
              className="border rounded-md p-2 w-full"
              value={form.city_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  city_id: Number(e.target.value),
                  subcity_id: "",
                  woreda_id: "",
                })
              }
            >
              <option value="">Select City</option>
              {cities.map((city: any) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* SUBCITY */}
          <div>
            <label className="text-sm font-medium">Subcity</label>
            <select
              className="border rounded-md p-2 w-full"
              value={form.subcity_id}
              disabled={!form.city_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  subcity_id: Number(e.target.value),
                  woreda_id: "",
                })
              }
            >
              <option value="">Select Subcity</option>
              {subcities
                .filter(
                  (sub: any) =>
                    Number(sub.city_id) === Number(form.city_id)
                )
                .map((sub: any) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
            </select>
          </div>

          {/* WOREDA */}
          <div className="col-span-2">
            <label className="text-sm font-medium">Woreda</label>
            <select
              className="border rounded-md p-2 w-full"
              value={form.woreda_id}
              disabled={!form.subcity_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  woreda_id: Number(e.target.value),
                })
              }
            >
              <option value="">Select Woreda</option>
              {woredas
                .filter(
                  (w: any) =>
                    Number(w.subcity_id) === Number(form.subcity_id)
                )
                .map((w: any) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
            </select>
          </div>

        </CardContent>

        {/* FOOTER */}
        <div className="p-4 border-t flex justify-between">
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>

          <Button disabled={!canSubmit} onClick={handleSubmit}>
            Create User
          </Button>
        </div>
      </Card>
    </div>
  );
}