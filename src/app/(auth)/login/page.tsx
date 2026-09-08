"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Masuk</CardTitle>
        <CardDescription>Lanjut menghitung biaya produksimu.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          {notice ? (
            <p className="text-sm text-foreground">{notice}</p>
          ) : null}
          {errors.map((e, i) => (
            <p
              key={i}
              role="alert"
              className="text-sm text-destructive"
            >
              {e.message}
            </p>
          ))}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="font-sans"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="font-sans"
            />
          </div>
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Memasuki..." : "Masuk"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Daftar
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}