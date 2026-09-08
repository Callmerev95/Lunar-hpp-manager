import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "optional",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lunar-hpp-manager.vercel.app"),
  title: "Lunar HPP",
  description: "Kalkulator harga pokok produksi untuk bahan makanan dan kue rumahan.",
  openGraph: {
    title: "Lunar HPP",
    description: "Kalkulator harga pokok produksi untuk bahan makanan dan kue rumahan.",
    url: "https://lunar-hpp-manager.vercel.app",
    siteName: "Lunar HPP",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FDF6ED" },
    { media: "(prefers-color-scheme: dark)", color: "#241A12" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${nunito.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
