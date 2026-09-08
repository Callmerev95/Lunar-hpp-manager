import { PasswordInput } from "./password-input";
import { loginAction } from "../actions";
import { AuthBranding } from "@/components/auth/auth-branding";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { registered, error } = await searchParams;

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
          <form action={loginAction} className="space-y-5">
            {registered ? (
              <p className="text-center text-sm text-primary">
                Akun dibuat. Silakan masuk.
              </p>
            ) : null}
            {error ? (
              <p
                role="alert"
                className="text-center text-sm text-destructive"
              >
                {error}
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="h-11 rounded-xl pl-10 font-sans"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput autoComplete="current-password" />
            </div>
            <button
              type="submit"
              className={buttonVariants({
                className: "h-11 w-full font-semibold",
              })}
            >
              Masuk
            </button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <a
          href="/register"
          className="font-semibold text-primary hover:underline"
        >
          Daftar sekarang
        </a>
      </p>
    </div>
  );
}
