"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import { loginAction, type AuthError } from "@/app/(auth)/actions";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [errors, setErrors] = useState<AuthError[]>([]);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const notice = searchParams.get("registered")
    ? "Akun dibuat. Silakan masuk."
    : "";

  async function action(formData: FormData) {
    setPending(true);
    setErrors([]);
    const result = await loginAction(formData);
    if (result) {
      setErrors([result]);
      setPending(false);
    }
  }

  return (
    <div>
      <AuthBranding />
      <Card className="min-h-[22rem] [--card-spacing:--spacing(6)]">
        <CardHeader className="gap-2 pb-2 text-center">
          <CardTitle className="font-heading text-2xl font-bold">
            Selamat datang
          </CardTitle>
          <CardDescription>
            Lanjut menghitung biaya produksimu.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <form action={action} className="space-y-5">
            {notice ? (
              <p className="text-center text-sm text-primary">{notice}</p>
            ) : null}
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
                  autoComplete="current-password"
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
            </div>
            <Button
              type="submit"
              disabled={pending}
              className="h-11 w-full font-semibold"
            >
              {pending ? "Memasuki..." : "Masuk"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary hover:underline"
        >
          Daftar sekarang
        </Link>
      </p>
    </div>
  );
}
