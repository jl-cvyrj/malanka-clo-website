import Link from "next/link";
import { CategoryCarousel } from "@/components/home/CategoryCarousel";
import { HeroStrip } from "@/components/home/HeroStrip";
import { ParallaxStrip } from "@/components/home/ParallaxStrip";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCategories, getProducts } from "@/lib/api/public";
import type { Category, ProductSummary } from "@/lib/api/types";
import { t } from "@/locales";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default async function HomePage() {
  let categories: Category[] = [];
  let products: ProductSummary[] = [];

  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }

  try {
    const page = await getProducts({ sort: "newest", page: 0, size: 8 });
    products = page.content;
  } catch {
    products = [];
  }

  return (
    <>
      <HeroStrip
        imageSrc="/images/new.png"
        imageAlt={t.home.heroTitle}
        title={t.home.heroTitle}
        align="left"
      />

      <ParallaxStrip text={t.home.aboutTitle} />

      <section className={styles.categoriesSection}>
        <div className={styles.container}>
          <h2 className={styles.categoriesTitle}>{t.home.categoriesTitle}</h2>
          {categories.length > 0 ? (
            <CategoryCarousel categories={categories} />
          ) : (
            <EmptyState title={t.home.noCategories} />
          )}
        </div>
      </section>

      <HeroStrip
        imageSrc="/images/new.png"
        imageAlt={t.home.seasonTitle}
        title={t.home.seasonTitle}
        align="right"
        background="#d7d7d7"
      />

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t.home.allProductsTitle}</h2>
            <Link href="/catalog" className={styles.viewAll}>
              <span>{t.home.viewAll}</span>
              <ArrowIcon />
            </Link>
          </div>

          {products.length > 0 ? (
            <>
              <ProductGrid products={products} />
              <div className={styles.viewAllCenter}>
                <Link href="/catalog" className={styles.viewAll}>
                  <span>{t.home.viewAll}</span>
                  <ArrowIcon />
                </Link>
              </div>
            </>
          ) : (
            <EmptyState title={t.home.noProducts} />
          )}
        </div>
      </section>
    </>
  );
}
