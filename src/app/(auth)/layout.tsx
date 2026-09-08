export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}