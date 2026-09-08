import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppNav } from "@/components/app-nav";
import { Toaster } from "@/components/ui/sonner";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex w-full max-w-[52rem] flex-1 flex-col px-4 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="inline-block text-2xl motion-safe:animate-[float_3s_ease-in-out_infinite]"
          >
            🍪
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-heading text-lg font-semibold">
              Lunar HPP
            </span>
            <span className="text-xs text-muted-foreground">
              Kalkulator harga pokok produksi
            </span>
          </span>
        </Link>
        <AppNav />
        <div className="flex items-center gap-3">
          <span className="hidden max-w-[12rem] truncate text-sm text-muted-foreground sm:block">
            {user.email}
          </span>
          <ThemeToggle />
          <SignOutButton />
        </div>
      </header>
      <main className="flex-1 py-6">{children}</main>
      <Toaster />
    </div>
  );
}