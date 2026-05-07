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

  /* ================= DATA ================= */

  const { data: citiesData } = useCities(1);
  const { data: subcitiesData } = useSubcities(1);
  const { data: woredasData } = useWoredas(1);

  const { roles } = useRoles();

  const cities = citiesData?.data || [];
  const subcities = subcitiesData?.data || [];
  const woredas = woredasData?.data || [];

  /* ================= FORM ================= */

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

  /* ================= PASSWORD ================= */

  const passwordState = useMemo(() => {
    return checkPassword(form.password);
  }, [form.password]);

  /* ================= USER LEVEL ================= */

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

  /* ================= VALIDATION ================= */

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

  /* ================= RESET ================= */

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

  /* ================= SUBMIT ================= */

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

        onError: (error: any) => {
          console.log(error);

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
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

          {/* EMAIL */}
          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          {/* PHONE */}
          <Input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
          />

          {/* PASSWORD */}
          <Input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />

          {/* CONFIRM PASSWORD */}
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

          {/* DATE OF BIRTH */}
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

          {/* ADDRESS */}
          <Input
            placeholder="Address"
            value={form.address}
            onChange={(e) =>
              setForm({
                ...form,
                address: e.target.value,
              })
            }
          />

          {/* GENDER */}
          <select
            className="border rounded-md p-2"
            value={form.gender}
            onChange={(e) =>
              setForm({
                ...form,
                gender: e.target.value as any,
              })
            }
          >
            <option value="">Gender</option>

            <option value="male">Male</option>

            <option value="female">Female</option>
          </select>

          {/* ROLE */}
          <select
            className="border rounded-md p-2"
            value={form.role}
            onChange={(e) =>
              setForm({
                ...form,
                role: e.target.value,
              })
            }
          >
            <option value="">Select Role</option>

            {roles?.map((role: any) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          {/* CITY */}
          <select
            className="border rounded-md p-2"
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
            <option value="">Select City *</option>

            {cities.map((city: any) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>

          {/* SUBCITY */}
          <select
            className="border rounded-md p-2"
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
              .map((subcity: any) => (
                <option key={subcity.id} value={subcity.id}>
                  {subcity.name}
                </option>
              ))}
          </select>

          {/* WOREDA */}
          <select
            className="border rounded-md p-2 col-span-2"
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
              .map((woreda: any) => (
                <option key={woreda.id} value={woreda.id}>
                  {woreda.name}
                </option>
              ))}
          </select>

          {/* USER LEVEL */}
          <div className="col-span-2">
            <div className="border rounded-md p-3 bg-gray-50">
              <p className="text-sm text-gray-500">
                User Level
              </p>

              <p className="font-semibold">
                {userLevel || "No level selected"}
              </p>
            </div>
          </div>
        </CardContent>

        {/* FOOTER */}
        <div className="p-4 border-t space-y-4">
          {/* PASSWORD STRENGTH */}
          <div className="space-y-2">
            <div className="h-2 bg-gray-200 rounded">
              <div
                className="h-2 bg-green-500 rounded transition-all"
                style={{
                  width: `${passwordState.percent}%`,
                }}
              />
            </div>

            <p className="text-xs text-gray-500">
              Password must contain:
              8+ chars, uppercase, special character
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={reset}
            >
              Reset
            </Button>

            <Button
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              Create User
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}