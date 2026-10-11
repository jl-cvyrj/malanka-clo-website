import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";
import { t } from "@/locales";

export const metadata: Metadata = {
  title: t.admin.loginTitle,
  // The admin area is not linked publicly and must not be indexed.
  robots: { index: false, follow: false },
};

function sanitizeNext(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  // Only allow same-origin admin paths to avoid open redirects.
  if (raw && raw.startsWith("/admin") && !raw.startsWith("//")) return raw;
  return "/admin";
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return <LoginForm next={sanitizeNext(params.next)} />;
}
