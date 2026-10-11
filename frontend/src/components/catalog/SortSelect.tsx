"use client";

import { useRouter } from "next/navigation";
import { PRODUCT_SORTS, productSortLabel } from "@/lib/format";
import { catalogHref } from "@/lib/url";
import type { ProductSort } from "@/lib/api/types";
import { t } from "@/locales";
import styles from "./SortSelect.module.css";

export function SortSelect({
  value,
  category,
}: {
  value: ProductSort;
  category?: string;
}) {
  const router = useRouter();

  return (
    <label className={styles.wrap}>
      <span className={styles.label}>{t.catalog.sortLabel}</span>
      <select
        className={styles.select}
        value={value}
        onChange={(event) => {
          // Changing the sort resets pagination to the first page.
          router.push(catalogHref({ category, sort: event.target.value }));
        }}
      >
        {PRODUCT_SORTS.map((sort) => (
          <option key={sort} value={sort}>
            {productSortLabel(sort)}
          </option>
        ))}
      </select>
    </label>
  );
}
