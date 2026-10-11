"use client";

import Link from "next/link";
import { cartItemKey, useCart } from "@/components/cart/CartProvider";
import { ProductImage } from "@/components/product/ProductImage";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { formatPrice } from "@/lib/format";
import { t } from "@/locales";
import styles from "./CartView.module.css";

export function CartView() {
  const { items, ready, subtotal, currency, updateQuantity, removeItem, clear } =
    useCart();

  if (!ready) {
    return <Spinner full />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>{t.cart.title}</h1>

        {items.length === 0 ? (
          <EmptyState title={t.cart.empty}>
            <ButtonLink href="/catalog" variant="secondary">
              {t.cart.continueShopping}
            </ButtonLink>
          </EmptyState>
        ) : (
          <>
            <div className={styles.list}>
              {items.map((item) => {
                const key = cartItemKey(item.productId, item.sizeCode);
                return (
                  <div key={key} className={styles.row}>
                    <Link href={`/products/${encodeURIComponent(item.slug)}`}>
                      <ProductImage
                        src={item.imageUrl}
                        alt={item.name}
                        className={styles.thumb}
                      />
                    </Link>

                    <div>
                      <p className={styles.name}>
                        <Link href={`/products/${encodeURIComponent(item.slug)}`}>
                          {item.name}
                        </Link>
                      </p>
                      <p className={styles.meta}>
                        {t.product.size}: {item.sizeCode}
                      </p>
                      <p className={styles.meta}>
                        {formatPrice(item.price, item.currency)}
                      </p>
                    </div>

                    <div className={styles.qty}>
                      <button
                        type="button"
                        className={styles.qtyButton}
                        onClick={() => updateQuantity(key, item.quantity - 1)}
                        aria-label={`${item.name} -1`}
                      >
                        −
                      </button>
                      <span className={styles.qtyValue}>{item.quantity}</span>
                      <button
                        type="button"
                        className={styles.qtyButton}
                        onClick={() => updateQuantity(key, item.quantity + 1)}
                        aria-label={`${item.name} +1`}
                      >
                        +
                      </button>
                    </div>

                    <div className={styles.cell}>
                      {formatPrice(item.price * item.quantity, item.currency)}
                    </div>

                    <button
                      type="button"
                      className={styles.remove}
                      onClick={() => removeItem(key)}
                    >
                      {t.cart.remove}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className={styles.summary}>
              <div className={styles.subtotalRow}>
                <span className={styles.subtotalLabel}>{t.cart.subtotal}</span>
                <span className={styles.subtotalValue}>
                  {formatPrice(subtotal, currency)}
                </span>
              </div>
              <div className={styles.actions}>
                <button type="button" className={styles.clear} onClick={clear}>
                  {t.cart.clear}
                </button>
                <ButtonLink href="/checkout" size="lg">
                  {t.cart.checkout}
                </ButtonLink>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
