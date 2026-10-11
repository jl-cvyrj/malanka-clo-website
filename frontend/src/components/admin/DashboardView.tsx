"use client";

import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { getAdminCategories, getAdminOrders, getAdminProducts } from "@/lib/api/admin";
import { useAsync } from "@/lib/hooks/useAsync";
import { t } from "@/locales";
import shared from "./admin.module.css";
import styles from "./DashboardView.module.css";

export function DashboardView() {
  const products = useAsync(
    (signal) => getAdminProducts({ page: 0, size: 1 }, signal),
    [],
  );
  const categories = useAsync((signal) => getAdminCategories(signal), []);
  const newOrders = useAsync(
    (signal) => getAdminOrders({ status: "NEW", page: 0, size: 1 }, signal),
    [],
  );

  const loading = products.loading || categories.loading || newOrders.loading;
  const error = products.error ?? categories.error ?? newOrders.error;

  return (
    <div className={shared.page}>
      <div className={shared.pageHeader}>
        <h1 className={shared.title}>{t.admin.dashboard.title}</h1>
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      {loading ? (
        <Spinner full />
      ) : (
        <div className={styles.grid}>
          <div className={styles.stat}>
            <p className={styles.statValue}>{products.data?.totalElements ?? 0}</p>
            <p className={styles.statLabel}>{t.admin.dashboard.productCount}</p>
            <Link href="/admin/products" className={styles.statLink}>
              {t.admin.nav.products}
            </Link>
          </div>

          <div className={styles.stat}>
            <p className={styles.statValue}>{categories.data?.length ?? 0}</p>
            <p className={styles.statLabel}>{t.admin.dashboard.categoryCount}</p>
            <Link href="/admin/categories" className={styles.statLink}>
              {t.admin.nav.categories}
            </Link>
          </div>

          <div className={styles.stat}>
            <p className={styles.statValue}>{newOrders.data?.totalElements ?? 0}</p>
            <p className={styles.statLabel}>{t.admin.dashboard.newOrders}</p>
            <Link href="/admin/orders" className={styles.statLink}>
              {t.admin.nav.orders}
            </Link>
          </div>
        </div>
      )}

      <p className={styles.hint}>{t.admin.dashboard.hint}</p>
    </div>
  );
}
