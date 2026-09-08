import { PasswordInput } from "./password-input";
import { registerAction } from "../actions";
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

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { error } = await searchParams;

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
          <form action={registerAction} className="space-y-5">
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
              <PasswordInput autoComplete="new-password" />
              <p className="text-xs text-muted-foreground">
                Minimal 6 karakter.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi password</Label>
              <PasswordInput autoComplete="new-password" confirm />
            </div>
            <button type="submit" className={buttonVariants({ className: "h-11 w-full font-semibold" })}>
              Daftar
            </button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <a href="/login" className="font-semibold text-primary hover:underline">
          Masuk
        </a>
      </p>
    </div>
  );
}
