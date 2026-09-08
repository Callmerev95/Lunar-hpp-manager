import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";

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
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 sm:px-6">
      <header className="flex items-center justify-between gap-4 border-b border-border py-4">
        <Link href="/" className="font-heading text-lg font-semibold">
          Catatan HPP
        </Link>
        <nav className="flex items-center gap-1 text-sm" aria-label="Menu utama">
          <Link
            href="/"
            className="rounded-md px-3 py-2 hover:bg-muted"
          >
            Resep
          </Link>
          <Link
            href="/materials"
            className="rounded-md px-3 py-2 hover:bg-muted"
          >
            Bahan
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden max-w-[12rem] truncate text-sm text-muted-foreground sm:block">
            {user.email}
          </span>
          <ThemeToggle />
          <SignOutButton />
        </div>
      </header>
      <main className="flex-1 py-6">{children}</main>
    </div>
  );
}