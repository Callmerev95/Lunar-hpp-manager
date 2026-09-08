export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-12">
      <span
        aria-hidden="true"
        className="absolute -left-20 top-16 size-64 rounded-full bg-primary/8 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="absolute -right-24 bottom-10 size-72 rounded-full bg-accent/25 blur-3xl"
      />
      <div className="relative w-full max-w-md">{children}</div>
    </main>
  );
}