"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { authService } from "@/services/auth/auth.service";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "other" | "";
  date_of_birth: string;
  address: string;
  location_level: string;
  city_name: string;
  subcity_name: string;
  woreda_name: string;
};

function locationLevelFromUser(user: any) {
  if (user?.woreda_id) return "Woreda Level";
  if (user?.subcity_id) return "Subcity Level";
  if (user?.city_id) return "City Level";
  return "-";
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(authService.getStoredUser());
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [form, setForm] = useState<ProfileForm>({
    name: "",
    email: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    address: "",
    location_level: "",
    city_name: "",
    subcity_name: "",
    woreda_name: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  useEffect(() => {
    let mounted = true;

    authService.profile().then((profile: any) => {
      if (!mounted) return;

      const value = profile?.data || profile;

      setUser(value);
      localStorage.setItem("user", JSON.stringify(value));

      setForm({
        name: value?.name || "",
        email: value?.email || "",
        phone: value?.phone || "",
        gender: value?.gender || "",
        date_of_birth: value?.date_of_birth || "",
        address: value?.address || "",
        location_level: value?.location_level || locationLevelFromUser(value),
        city_name: value?.city?.name || "-",
        subcity_name: value?.subcity?.name || "-",
        woreda_name: value?.woreda?.name || "-",
      });
    });

    return () => {
      mounted = false;
    };
  }, []);

  async function updateProfile() {
    if (!form.name.trim()) return toast.error("Name is required");

    const payload = new FormData();

    /*
    |--------------------------------------------------------------------------
    | Editable profile fields only
    |--------------------------------------------------------------------------
    | Email, phone, and location are shown read-only and are not submitted.
    */
    payload.append("name", form.name.trim());

    if (form.gender) payload.append("gender", form.gender);
    if (form.date_of_birth) payload.append("date_of_birth", form.date_of_birth);
    if (form.address) payload.append("address", form.address);
    if (profileImage) payload.append("profile", profileImage);

    try {
      setSavingProfile(true);

      const response: any = await authService.updateProfile(payload);
      const updated = response?.data || response;

      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));

      setForm((current) => ({
        ...current,
        name: updated?.name || current.name,
        gender: updated?.gender || "",
        date_of_birth: updated?.date_of_birth || "",
        address: updated?.address || "",
      }));

      toast.success("Profile updated successfully");
    } catch (error: any) {
      const errors = error?.response?.data?.errors;

      if (errors) {
        const first = Object.values(errors)?.[0] as any;
        toast.error(Array.isArray(first) ? first[0] : "Validation failed");
        return;
      }

      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword() {
    if (!passwordForm.current_password) {
      return toast.error("Current password is required");
    }

    if (passwordForm.new_password.length < 8) {
      return toast.error("New password must be at least 8 characters");
    }

    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      return toast.error("Passwords do not match");
    }

    try {
      setSavingPassword(true);

      await authService.changeOwnPassword(passwordForm);

      setPasswordForm({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });

      toast.success("Password changed successfully");
    } catch (error: any) {
      const errors = error?.response?.data?.errors;

      if (errors) {
        const first = Object.values(errors)?.[0] as any;
        toast.error(Array.isArray(first) ? first[0] : "Validation failed");
        return;
      }

      toast.error(error?.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground">
          Update your personal profile, profile photo, and password.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-muted text-2xl font-bold">
              {user?.profile_image_url ? (
                <img
                  src={user.profile_image_url}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                form.name?.charAt(0) || "U"
              )}
            </div>

            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(event) => setProfileImage(event.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">
                JPG, PNG, or WEBP. Max 2MB.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Input
              placeholder="Name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />

            <Input
              value={form.email}
              disabled
              readOnly
              className="cursor-not-allowed bg-muted"
              title="Email can only be changed by an admin."
            />

            <Input
              value={form.phone}
              disabled
              readOnly
              className="cursor-not-allowed bg-muted"
              title="Phone can only be changed by an admin."
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

            <Input
              type="date"
              value={form.date_of_birth}
              onChange={(event) => setForm({ ...form, date_of_birth: event.target.value })}
            />

            <Input
              placeholder="Address"
              value={form.address}
              onChange={(event) => setForm({ ...form, address: event.target.value })}
            />

            <Input
              value={form.location_level || "-"}
              disabled
              readOnly
              className="cursor-not-allowed bg-muted"
              title="Location can only be changed by an admin."
            />

            <Input
              value={form.city_name}
              disabled
              readOnly
              className="cursor-not-allowed bg-muted"
              title="Location can only be changed by an admin."
            />

            <Input
              value={form.subcity_name}
              disabled
              readOnly
              className="cursor-not-allowed bg-muted"
              title="Location can only be changed by an admin."
            />

            <Input
              value={form.woreda_name}
              disabled
              readOnly
              className="cursor-not-allowed bg-muted"
              title="Location can only be changed by an admin."
            />
          </div>

          <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
            Email, phone, and location cannot be changed from My Profile. Contact an admin to update those fields.
          </div>

          <div className="flex justify-end">
            <Button onClick={updateProfile} disabled={savingProfile}>
              {savingProfile ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              type="password"
              placeholder="Current Password"
              value={passwordForm.current_password}
              onChange={(event) =>
                setPasswordForm({
                  ...passwordForm,
                  current_password: event.target.value,
                })
              }
            />

            <Input
              type="password"
              placeholder="New Password"
              value={passwordForm.new_password}
              onChange={(event) =>
                setPasswordForm({
                  ...passwordForm,
                  new_password: event.target.value,
                })
              }
            />

            <Input
              type="password"
              placeholder="Confirm New Password"
              value={passwordForm.new_password_confirmation}
              onChange={(event) =>
                setPasswordForm({
                  ...passwordForm,
                  new_password_confirmation: event.target.value,
                })
              }
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={changePassword} disabled={savingPassword}>
              {savingPassword ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
