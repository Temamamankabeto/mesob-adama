"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Loader2, LogIn, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login({ login, password });
      authService.saveSession(response);

      document.cookie = `token=${response.token}; path=/`;

      const role =
        response.user?.roles?.[0]?.name ||
        response.user?.role ||
        "customer";

      document.cookie = `role=${role.toLowerCase()}; path=/`;

      toast.success("Logged in successfully");

      router.replace(searchParams.get("redirect") || "/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-emerald-950 p-4">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 lg:grid-cols-2">
        <section className="hidden text-white lg:block">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            Secure Municipal Digital Service Portal
          </div>

          <h1 className="max-w-xl text-5xl font-bold leading-tight">
            Adama City Masob eService Platform
          </h1>

          <p className="mt-5 max-w-lg text-lg text-white/75">
            Access government services, track applications, manage approvals,
            and serve citizens through one trusted digital office.
          </p>

          <div className="mt-8 grid max-w-lg grid-cols-2 gap-4">
            {["Fast Service", "Secure Login", "Application Tracking", "Role Based Access"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"
                >
                  <p className="font-semibold">{item}</p>
                </div>
              )
            )}
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-lg">
                <Building2 className="h-8 w-8" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900">
                Welcome Back
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Login with email or phone number
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Email or Phone</Label>
                <Input
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="example@gmail.com or +2519xxxxxxx"
                  required
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl"
                />
              </div>

              <Button
                className="h-12 w-full rounded-xl bg-blue-700 text-base hover:bg-blue-800"
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
              <Link href="/register" className="font-medium text-blue-700 hover:underline">
                Create account
              </Link>
              <Link href="/" className="font-medium text-slate-600 hover:text-blue-700">
                Back to home
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}