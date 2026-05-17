"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      const response = await authService.login({
        login,
        password,
      });

      // Save session (localStorage etc.)
      authService.saveSession(response);

      // =========================
      // FIX: SAVE TOKEN + ROLE IN COOKIE
      // =========================

      document.cookie = `token=${response.token}; path=/`;

      // Safe role extraction (Spatie / API flexible)
      const role =
        response.user?.roles?.[0]?.name ||
        response.user?.role ||
        "customer";

      document.cookie = `role=${role.toLowerCase()}; path=/`;

      toast.success("Logged in successfully");

      // =========================
      // REDIRECT BACK LOGIC
      // =========================
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
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold">
            Sign in
          </CardTitle>
          <CardDescription>
            Login with email or phone number
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">

            {/* EMAIL OR PHONE */}
            <div className="space-y-2">
              <Label>Email or Phone</Label>
              <Input
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="example@gmail.com or +2519xxxxxxx"
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* BUTTON */}
            <Button className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Login
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New customer?{" "}
            <Link
              href="/register"
              className="text-primary underline hover:underline"
            >
              Create account
            </Link>
            {/* back to home */}
            <Link
              href="/"
              className="ml-4 text-primary underline hover:underline"
            >
              Back to home
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}