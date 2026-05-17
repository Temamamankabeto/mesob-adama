"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useCreateUser } from "@/hooks/user/useUsers";
import { useCities } from "@/hooks/location/useCities";
import { useSubcities } from "@/hooks/location/useSubcities";
import { useWoredas } from "@/hooks/location/useWoredas";
import { useRoles } from "@/hooks/roles/useRoles";

import {
  getRoleOption,
  LOCATION_LEVELS,
  LocationLevel,
  roleLabel,
} from "@/config/roles.config";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  city_id: number | "";
  subcity_id: number | "";
  woreda_id: number | "";
};

const initialForm: Form = {
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
};

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

  // ✅ FIXED
  const { data: cities = [] } = useCities();
  const { data: subcities = [] } = useSubcities();
  const { data: woredas = [] } = useWoredas();

  const { roles } = useRoles();

  const [form, setForm] = useState<Form>(initialForm);

  const selectedRole = useMemo(
    () => getRoleOption(form.role),
    [form.role]
  );

  const passwordState = useMemo(
    () => checkPassword(form.password),
    [form.password]
  );

  // ✅ FILTERED DATA
  const filteredSubcities = subcities.filter(
    (subcity: any) =>
      Number(subcity.city_id) === Number(form.city_id)
  );

  const filteredWoredas = woredas.filter(
    (woreda: any) =>
      Number(woreda.subcity_id) === Number(form.subcity_id)
  );

  const requiresCity =
    selectedRole.isScoped &&
    ["city", "subcity", "woreda"].includes(
      form.location_level
    );

  const requiresSubcity =
    selectedRole.isScoped &&
    ["subcity", "woreda"].includes(
      form.location_level
    );

  const requiresWoreda =
    selectedRole.isScoped &&
    form.location_level === "woreda";

  const canSubmit =
    form.name &&
    form.email &&
    form.phone &&
    form.password &&
    form.confirm_password &&
    form.password === form.confirm_password &&
    passwordState.valid &&
    form.role &&
    (!selectedRole.isScoped ||
      form.location_level) &&
    (!requiresCity || form.city_id) &&
    (!requiresSubcity || form.subcity_id) &&
    (!requiresWoreda || form.woreda_id);

  function reset() {
    setForm(initialForm);
    toast.info("Form reset");
  }

  function validate() {
    if (!form.role) {
      toast.error("Role is required");
      return false;
    }

    if (
      selectedRole.isScoped &&
      !form.location_level
    ) {
      toast.error(
        "Location level is required"
      );
      return false;
    }

    if (requiresCity && !form.city_id) {
      toast.error("City is required");
      return false;
    }

    if (
      requiresSubcity &&
      !form.subcity_id
    ) {
      toast.error("Subcity is required");
      return false;
    }

    if (
      requiresWoreda &&
      !form.woreda_id
    ) {
      toast.error("Woreda is required");
      return false;
    }

    if (
      form.password !==
      form.confirm_password
    ) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  }

  function handleSubmit() {
    if (!validate()) return;

    createUser.mutate(
      {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        date_of_birth:
          form.date_of_birth || undefined,
        address: form.address || undefined,
        gender: form.gender || undefined,
        role: form.role,

        location_level:
          selectedRole.isScoped
            ? form.location_level
            : undefined,

        city_id: requiresCity
          ? form.city_id
          : undefined,

        subcity_id: requiresSubcity
          ? form.subcity_id
          : undefined,

        woreda_id: requiresWoreda
          ? form.woreda_id
          : undefined,
      },
      {
        onSuccess: () => {
          toast.success(
            "User created successfully"
          );

          router.push(
            "/dashboard/users"
          );
        },

        onError: (error: any) => {
          toast.error(
            error?.message ||
              "Failed to create user"
          );
        },
      }
    );
  }

  return (
    <div className="p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            Create User
          </CardTitle>

          <p className="text-sm text-muted-foreground">
            Role controls responsibility.
            Location level controls
            working area.
          </p>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* NAME */}
          <div>
            <label className="text-sm font-medium">
              Name
            </label>

            <Input
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value,
                })
              }
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium">
              Email
            </label>

            <Input
              value={form.email}
              onChange={(event) =>
                setForm({
                  ...form,
                  email: event.target.value,
                })
              }
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="text-sm font-medium">
              Phone
            </label>

            <Input
              value={form.phone}
              onChange={(event) =>
                setForm({
                  ...form,
                  phone: event.target.value,
                })
              }
            />
          </div>

          {/* GENDER */}
          <div>
            <label className="text-sm font-medium">
              Gender
            </label>

            <select
              className="w-full rounded-md border p-2"
              value={form.gender}
              onChange={(event) =>
                setForm({
                  ...form,
                  gender:
                    event.target
                      .value as any,
                })
              }
            >
              <option value="">
                Select Gender
              </option>

              <option value="male">
                Male
              </option>

              <option value="female">
                Female
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm font-medium">
              Password
            </label>

            <Input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm({
                  ...form,
                  password:
                    event.target.value,
                })
              }
            />

            <div className="mt-2 h-2 rounded bg-muted">
              <div
                className="h-2 rounded bg-primary"
                style={{
                  width: `${passwordState.percent}%`,
                }}
              />
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="text-sm font-medium">
              Confirm Password
            </label>

            <Input
              type="password"
              value={
                form.confirm_password
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  confirm_password:
                    event.target.value,
                })
              }
            />
          </div>

          {/* DOB */}
          <div>
            <label className="text-sm font-medium">
              Date of Birth
            </label>

            <Input
              type="date"
              value={form.date_of_birth}
              onChange={(event) =>
                setForm({
                  ...form,
                  date_of_birth:
                    event.target.value,
                })
              }
            />
          </div>

          {/* ADDRESS */}
          <div>
            <label className="text-sm font-medium">
              Address
            </label>

            <Input
              value={form.address}
              onChange={(event) =>
                setForm({
                  ...form,
                  address:
                    event.target.value,
                })
              }
            />
          </div>

          {/* ROLE */}
          <div>
            <label className="text-sm font-medium">
              Role
            </label>

            <select
              className="w-full rounded-md border p-2"
              value={form.role}
              onChange={(event) => {
                const role =
                  getRoleOption(
                    event.target.value
                  );

                setForm({
                  ...form,
                  role:
                    event.target.value,

                  location_level:
                    role.isScoped
                      ? "city"
                      : "",

                  city_id: "",
                  subcity_id: "",
                  woreda_id: "",
                });
              }}
            >
              <option value="">
                Select Role
              </option>

              {roles?.map((role: any) => (
                <option
                  key={
                    role.id ||
                    role.name
                  }
                  value={role.name}
                >
                  {role.label ||
                    roleLabel(
                      role.name
                    )}
                </option>
              ))}
            </select>
          </div>

          {/* LOCATION LEVEL */}
          {selectedRole.isScoped && (
            <div>
              <label className="text-sm font-medium">
                Location Level
              </label>

              <select
                className="w-full rounded-md border p-2"
                value={
                  form.location_level
                }
                onChange={(event) =>
                  setForm({
                    ...form,

                    location_level:
                      event.target
                        .value as LocationLevel,

                    city_id: "",
                    subcity_id: "",
                    woreda_id: "",
                  })
                }
              >
                {LOCATION_LEVELS.map(
                  (level) => (
                    <option
                      key={level.value}
                      value={
                        level.value
                      }
                    >
                      {level.label}
                    </option>
                  )
                )}
              </select>
            </div>
          )}

          {/* CITY */}
          {requiresCity && (
            <div>
              <label className="text-sm font-medium">
                City
              </label>

              <select
                className="w-full rounded-md border p-2"
                value={form.city_id}
                onChange={(event) =>
                  setForm({
                    ...form,

                    city_id:
                      event.target.value
                        ? Number(
                            event.target
                              .value
                          )
                        : "",

                    subcity_id: "",
                    woreda_id: "",
                  })
                }
              >
                <option value="">
                  Select City
                </option>

                {cities.map(
                  (city: any) => (
                    <option
                      key={city.id}
                      value={city.id}
                    >
                      {city.name}
                    </option>
                  )
                )}
              </select>
            </div>
          )}

          {/* SUBCITY */}
          {requiresSubcity && (
            <div>
              <label className="text-sm font-medium">
                Subcity
              </label>

              <select
                className="w-full rounded-md border p-2"
                value={
                  form.subcity_id
                }
                disabled={
                  !form.city_id
                }
                onChange={(event) =>
                  setForm({
                    ...form,

                    subcity_id:
                      event.target.value
                        ? Number(
                            event.target
                              .value
                          )
                        : "",

                    woreda_id: "",
                  })
                }
              >
                <option value="">
                  Select Subcity
                </option>

                {filteredSubcities.map(
                  (subcity: any) => (
                    <option
                      key={subcity.id}
                      value={
                        subcity.id
                      }
                    >
                      {subcity.name}
                    </option>
                  )
                )}
              </select>
            </div>
          )}

          {/* WOREDA */}
          {requiresWoreda && (
            <div>
              <label className="text-sm font-medium">
                Woreda
              </label>

              <select
                className="w-full rounded-md border p-2"
                value={form.woreda_id}
                disabled={
                  !form.subcity_id
                }
                onChange={(event) =>
                  setForm({
                    ...form,

                    woreda_id:
                      event.target.value
                        ? Number(
                            event.target
                              .value
                          )
                        : "",
                  })
                }
              >
                <option value="">
                  Select Woreda
                </option>

                {filteredWoredas.map(
                  (woreda: any) => (
                    <option
                      key={woreda.id}
                      value={
                        woreda.id
                      }
                    >
                      {woreda.name}
                    </option>
                  )
                )}
              </select>
            </div>
          )}
        </CardContent>

        <div className="flex justify-between border-t p-4">
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
      </Card>
    </div>
  );
} 