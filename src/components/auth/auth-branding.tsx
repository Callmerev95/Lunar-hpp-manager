export function AuthBranding() {
  return (
    <div className="mb-6 flex flex-col items-center text-center">
      <div className="mb-3 flex size-16 items-center justify-center rounded-full bg-white text-3xl shadow-[0_2px_8px_rgba(123,81,56,0.08)] dark:bg-card">
        <span aria-hidden="true">🍪</span>
      </div>
      <h1 className="font-heading text-3xl font-bold text-[#7B5138] dark:text-primary">
        Catatan HPP
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Kalkulator harga pokok produksi untuk jualan kue dan makanan rumahan
      </p>
    </div>
  );
}