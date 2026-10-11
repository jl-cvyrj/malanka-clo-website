"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { formatPrice } from "@/lib/format";
import { readLastOrder } from "@/lib/order-storage";
import type { Order } from "@/lib/api/types";
import { t } from "@/locales";
import styles from "./OrderSuccessView.module.css";

export function OrderSuccessView() {
  const [order, setOrder] = useState<Order | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setOrder(readLastOrder());
    setReady(true);
  }, []);

  if (!ready) return <Spinner full />;

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>{t.orderSuccess.title}</h1>
      <p className={styles.subtitle}>{t.orderSuccess.subtitle}</p>

      {order ? (
        <div className={styles.card}>
          <div className={styles.numberRow}>
            <span className={styles.numberLabel}>{t.orderSuccess.orderNumber}</span>
            <span className={styles.number}>{order.orderNumber}</span>
          </div>

          {order.items.map((item, index) => (
            <div key={`${item.productName}-${index}`} className={styles.row}>
              <span>
                {item.productName}
                {item.sizeCode ? ` · ${item.sizeCode}` : ""} × {item.quantity}
              </span>
              <span>{formatPrice(item.lineTotal, order.currency)}</span>
            </div>
          ))}

          <div className={styles.total}>
            <span>{t.orderSuccess.total}</span>
            <span>
              {formatPrice(order.totalAmount ?? order.subtotalAmount, order.currency)}
            </span>
          </div>
        </div>
      ) : (
        <div className={styles.card}>{t.orderSuccess.unknown}</div>
      )}

      <div className={styles.actions}>
        <ButtonLink href="/catalog" variant="secondary">
          {t.orderSuccess.continueShopping}
        </ButtonLink>
        <ButtonLink href="/">{t.orderSuccess.backHome}</ButtonLink>
      </div>
    </div>
  );
}
