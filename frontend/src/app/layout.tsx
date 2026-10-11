import type { Metadata, Viewport } from "next";
import { Oswald } from "next/font/google";
import { t } from "@/locales";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin", "cyrillic"],
  variable: "--font-oswald",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: t.meta.title,
    template: `%s · ${t.meta.title}`,
  },
  description: t.meta.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="be" className={oswald.variable}>
      <body>{children}</body>
    </html>
  );
}
