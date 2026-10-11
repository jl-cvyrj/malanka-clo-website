import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/product/AddToCart";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ApiError } from "@/lib/api/client";
import { getProduct } from "@/lib/api/public";
import { t } from "@/locales";
import styles from "./product.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProduct(slug);
    return {
      title: product.name,
      description: product.description ?? undefined,
    };
  } catch {
    return { title: t.product.notFound };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product;
  try {
    product = await getProduct(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <ProductGallery images={product.images} productName={product.name} />

        <div className={styles.info}>
          <div>
            <Link href="/catalog" className={styles.breadcrumb}>
              ← {t.product.backToCatalog}
            </Link>
            <p className={styles.category}>{product.categoryName}</p>
            <h1 className={styles.title}>{product.name}</h1>
          </div>

          {product.description ? (
            <div>
              <p className={styles.category}>{t.product.description}</p>
              <p className={styles.description}>{product.description}</p>
            </div>
          ) : null}

          <AddToCart product={product} />
        </div>
      </div>
    </div>
  );
}
