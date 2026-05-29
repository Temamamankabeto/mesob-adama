"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, LogIn, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth/auth.service";

import mesob from "@/app/mesob.jpg";

type RoleValue = string | { name?: string };

function getUserRole(user: any): string {
  const firstRole = user?.roles?.[0] as RoleValue | undefined;

  if (typeof firstRole === "string") return firstRole;
  if (firstRole?.name) return firstRole.name;
  if (typeof user?.role === "string") return user.role;

  return "customer";
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login({
        email: login,
        password,
      });

      authService.saveSession(response);

      document.cookie = `token=${response.token}; path=/`;

      const role = getUserRole(response.user);

      document.cookie = `role=${role.toLowerCase()}; path=/`;

      toast.success("Logged in successfully");

      const redirect =
        searchParams.get("redirect") || "/dashboard";

      router.replace(redirect);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-10 lg:grid-cols-2">
        {/* Left Side */}
        <section className="hidden lg:flex flex-col justify-center">
          <div className="max-w-xl">
        <div className="mb-6 flex justify-center">
  <Image
    src={mesob}
    alt="Adama MESOB eService"
    width={120}
    height={120}
    priority
    className="h-28 w-28 object-contain"
  />
</div>

            <h1 className="text-5xl font-bold tracking-tight text-slate-900">
              Adama MESOB eService
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              Access government services, track applications,
              manage approvals, monitor workflows, and serve
              citizens through one integrated digital platform.
            </p>

            <div className="mt-8 flex items-center gap-3 rounded-2xl border bg-slate-50 p-4">
              <ShieldCheck className="h-6 w-6 text-green-600" />
              <span className="text-sm font-medium text-slate-700">
                Secure Government Digital Service Platform
              </span>
            </div>
          </div>
        </section>

        {/* Login Card */}
        <section className="mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex justify-center">
                {/* <div className="rounded-2xl border bg-white p-3 shadow-md">
                  <Image
                    src={mesob}
                    alt="Adama MESOB eService"
                    width={90}
                    height={90}
                    priority
                    className="h-20 w-20 object-contain"
                  />
                </div> */}
              </div>

              <h2 className="text-2xl font-bold text-slate-900">
                Welcome Back
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Login with email or phone number
              </p>
            </div>

            <form
              onSubmit={onSubmit}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="login">
                  Email or Phone
                </Label>

                <Input
                  id="login"
                  value={login}
                  onChange={(e) =>
                    setLogin(e.target.value)
                  }
                  placeholder="example@gmail.com or +2519xxxxxxx"
                  required
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password
                </Label>

                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  className="h-12 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-xl text-base"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-5 w-5" />
                )}

                Login
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm">
              <Link
                href="/register"
                className="font-medium text-primary hover:underline"
              >
                Create account
              </Link>

              <Link
                href="/"
                className="font-medium text-slate-600 hover:text-primary"
              >
                Back to home
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}