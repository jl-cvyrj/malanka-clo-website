"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { logout, me } from "@/lib/api/admin";
import { useAsync } from "@/lib/hooks/useAsync";
import { t } from "@/locales";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import styles from "./AdminShell.module.css";

const NAV = [
  { href: "/admin", label: t.admin.nav.dashboard },
  { href: "/admin/products", label: t.admin.nav.products },
  { href: "/admin/categories", label: t.admin.nav.categories },
  { href: "/admin/orders", label: t.admin.nav.orders },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, loading, error, errorStatus } = useAsync(
    (signal) => me(signal),
    [],
  );

  useEffect(() => {
    if (errorStatus === 401) {
      router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [errorStatus, router, pathname]);

  if (loading || errorStatus === 401) {
    return <div className={styles.center}><Spinner full /></div>;
  }

  if (error || !session) {
    return (
      <div className={styles.center}>
        <Alert tone="error">{error ?? t.common.error}</Alert>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // even if the call fails, drop the local session view
    }
    router.replace("/admin/login");
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.brand}>MALANKA</p>
          <p className={styles.brandSub}>{t.admin.loginTitle}</p>
        </div>

        <nav className={styles.nav}>
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${active ? styles.navActive : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.spacer} />

        <Link href="/" className={styles.navLink}>
          {t.admin.nav.toStore} ↗
        </Link>
      </aside>

      <div>
        <div className={styles.topbar}>
          <span className={styles.user}>
            {t.admin.loggedInAs}{" "}
            <span className={styles.username}>{session.username}</span>
          </span>
          <button
            type="button"
            className={styles.signOutButton}
            onClick={handleLogout}
          >
            {t.admin.logout}
          </button>
        </div>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
