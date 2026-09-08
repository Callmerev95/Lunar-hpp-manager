"use client";

import { useState } from "react";
import Link from "next/link";
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

  async function action(formData: FormData) {
    setPending(true);
    setErrors([]);
    const result = await registerAction(formData);
    if (result) {
      setErrors([result]);
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">
          Buka catatan baru
        </CardTitle>
        <CardDescription>
          Buat akun untuk mulai mencatat bahan dan resepmu.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          {errors.map((e, i) => (
            <p key={i} role="alert" className="text-sm text-destructive">
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
              autoComplete="new-password"
              required
              className="font-sans"
            />
            <p className="text-xs text-muted-foreground">
              Minimal 6 karakter.
            </p>
          </div>
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Membuat akun..." : "Daftar"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Masuk
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}