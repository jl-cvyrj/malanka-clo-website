import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { t } from "@/locales";
import type { ProductSummary } from "@/lib/api/types";
import { ProductImage } from "./ProductImage";
import styles from "./ProductCard.module.css";

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <Link href={`/products/${encodeURIComponent(product.slug)}`} className={styles.card}>
      <div className={styles.frame}>
        <ProductImage
          src={product.primaryImageUrl}
          alt={product.name}
          className={styles.image}
        />
        {!product.active ? (
          <span className={styles.badge}>{t.common.hidden}</span>
        ) : null}
        <div className={styles.caption}>
          <p className={styles.name}>{product.name}</p>
          <p className={styles.price}>
            {formatPrice(product.price, product.currency)}
          </p>
        </div>
      </div>
    </Link>
  );
}
