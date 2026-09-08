"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { AuthBranding } from "@/components/auth/auth-branding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { registerAction, type AuthError } from "@/app/(auth)/actions";

export default function RegisterPage() {
  const [errors, setErrors] = useState<AuthError[]>([]);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function action(formData: FormData) {
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    if (password !== confirmPassword) {
      setErrors([{ message: "Konfirmasi password tidak sama." }]);
      return;
    }
    setPending(true);
    setErrors([]);
    const result = await registerAction(formData);
    if (result) {
      setErrors([result]);
      setPending(false);
    }
  }

  return (
    <div>
      <AuthBranding />
      <Card className="min-h-[26rem] [--card-spacing:--spacing(6)]">
        <CardHeader className="gap-2 pb-2 text-center">
          <div
            className="mb-2 flex items-center justify-center gap-2"
            aria-hidden="true"
          >
            <span className="h-1.5 w-8 rounded-full bg-primary" />
            <span className="h-1.5 w-8 rounded-full bg-muted" />
            <span className="h-1.5 w-8 rounded-full bg-muted" />
          </div>
          <CardTitle className="font-heading text-2xl font-bold">
            Buat akun baru
          </CardTitle>
          <CardDescription>
            Isi datamu untuk mulai mencatat bahan dan resepmu.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <form action={action} className="space-y-5">
            {errors.map((e, i) => (
              <p
                key={i}
                role="alert"
                className="text-center text-sm text-destructive"
              >
                {e.message}
              </p>
            ))}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="h-11 rounded-xl pl-10 font-sans"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="h-11 rounded-xl pl-10 pr-10 font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Minimal 6 karakter.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="h-11 rounded-xl pl-10 pr-10 font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={
                    showConfirm ? "Sembunyikan password" : "Tampilkan password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={pending}
              className="h-11 w-full font-semibold"
            >
              {pending ? "Mendaftarkan..." : "Daftar"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}
