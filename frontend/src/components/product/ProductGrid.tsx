import type { ProductSummary } from "@/lib/api/types";
import { ProductCard } from "./ProductCard";
import styles from "./ProductGrid.module.css";

export function ProductGrid({ products }: { products: ProductSummary[] }) {
  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
