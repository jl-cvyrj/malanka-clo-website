"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import { compareSizes } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import type { ProductDetail } from "@/lib/api/types";
import { t } from "@/locales";
import styles from "./AddToCart.module.css";

export function AddToCart({ product }: { product: ProductDetail }) {
  const { addItem } = useCart();
  const sizes = [...product.sizes].sort(compareSizes);
  const availableSizes = sizes.filter((size) => size.available);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    availableSizes.length === 1 ? availableSizes[0].sizeCode : null,
  );
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const hasSizes = product.sizes.length > 0;

  const handleAdd = () => {
    if (!selectedSize) {
      setError(t.product.sizeRequired);
      return;
    }
    setError(null);
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        currency: product.currency,
        sizeCode: selectedSize,
        imageUrl: product.images[0]?.url ?? null,
      },
      quantity,
    );
    setAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className={styles.block}>
      <p className={styles.price}>{formatPrice(product.price, product.currency)}</p>

      {hasSizes ? (
        <div>
          <p className={styles.label}>{t.product.size}</p>
          <div className={styles.sizes}>
            {sizes.map((size) => (
              <button
                key={size.id}
                type="button"
                className={`${styles.size} ${
                  selectedSize === size.sizeCode ? styles.sizeActive : ""
                } ${size.available ? "" : styles.sizeDisabled}`}
                onClick={() => {
                  if (!size.available) return;
                  setSelectedSize(size.sizeCode);
                  setError(null);
                }}
                disabled={!size.available}
                aria-pressed={selectedSize === size.sizeCode}
                title={size.available ? size.sizeCode : t.product.outOfStock}
              >
                {size.sizeCode}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className={styles.note}>{t.product.noSizes}</p>
      )}

      <div>
        <p className={styles.label}>{t.product.quantity}</p>
        <div className={styles.qty}>
          <button
            type="button"
            className={styles.qtyButton}
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={quantity <= 1}
            aria-label="-1"
          >
            −
          </button>
          <span className={styles.qtyValue}>{quantity}</span>
          <button
            type="button"
            className={styles.qtyButton}
            onClick={() => setQuantity((value) => Math.min(99, value + 1))}
            disabled={quantity >= 99}
            aria-label="+1"
          >
            +
          </button>
        </div>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <Button size="lg" onClick={handleAdd} disabled={!hasSizes}>
        {t.product.addToCart}
      </Button>

      {added ? (
        <p className={styles.added}>
          {t.product.added} · <Link href="/cart">{t.cart.title}</Link>
        </p>
      ) : null}
    </div>
  );
}
