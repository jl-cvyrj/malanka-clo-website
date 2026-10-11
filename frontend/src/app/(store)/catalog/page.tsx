import type { Metadata } from "next";
import Link from "next/link";
import { CatalogPagination } from "@/components/catalog/CatalogPagination";
import { SortSelect } from "@/components/catalog/SortSelect";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCategories, getProducts } from "@/lib/api/public";
import type { Category, PageResponse, ProductSort, ProductSummary } from "@/lib/api/types";
import { PRODUCT_SORTS } from "@/lib/format";
import { catalogHref } from "@/lib/url";
import { t } from "@/locales";
import styles from "./catalog.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: t.catalog.title };

const PAGE_SIZE = 12;

function firstString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function toProductSort(value: string | undefined): ProductSort {
  return PRODUCT_SORTS.includes(value as ProductSort)
    ? (value as ProductSort)
    : "newest";
}

function toPage(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "0", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const category = firstString(params.category);
  const sort = toProductSort(firstString(params.sort));
  const page = toPage(firstString(params.page));

  let categories: Category[] = [];
  let products: PageResponse<ProductSummary> | null = null;

  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }

  try {
    products = await getProducts({ category, sort, page, size: PAGE_SIZE });
  } catch {
    products = null;
  }

  const activeCategory = categories.find((item) => item.slug === category);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          {activeCategory ? activeCategory.name : t.catalog.title}
        </h1>

        <nav className={styles.nav} aria-label={t.nav.categories}>
          <Link
            href={catalogHref({ sort })}
            className={`${styles.chip} ${!category ? styles.chipActive : ""}`}
          >
            {t.catalog.allCategories}
          </Link>
          {categories.map((item) => (
            <Link
              key={item.id}
              href={catalogHref({ category: item.slug, sort })}
              className={`${styles.chip} ${
                item.slug === category ? styles.chipActive : ""
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className={styles.toolbar}>
          <span className={styles.count}>
            {products ? t.catalog.results(products.totalElements) : ""}
          </span>
          <SortSelect value={sort} category={category} />
        </div>

        {products && products.content.length > 0 ? (
          <>
            <ProductGrid products={products.content} />
            <CatalogPagination
              page={products.page}
              totalPages={products.totalPages}
              category={category}
              sort={sort}
            />
          </>
        ) : (
          <EmptyState title={t.catalog.empty}>
            <span>{t.catalog.emptyHint}</span>
          </EmptyState>
        )}
      </div>
    </div>
  );
}
