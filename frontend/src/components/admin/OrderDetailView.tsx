"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { controlClass } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import {
  getAdminOrder,
  updateOrderPaymentStatus,
  updateOrderStatus,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import {
  PAYMENT_STATUSES,
  ORDER_STATUSES,
  deliveryMethodLabel,
  formatDateTime,
  formatPrice,
  orderStatusLabel,
  orderTypeLabel,
  paymentMethodLabel,
  paymentStatusLabel,
} from "@/lib/format";
import { useAsync } from "@/lib/hooks/useAsync";
import type { OrderStatus, PaymentStatus } from "@/lib/api/types";
import { t } from "@/locales";
import shared from "./admin.module.css";
import styles from "./OrderDetailView.module.css";

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.meta}>
      <span className={styles.metaLabel}>{label}</span>
      <span className={styles.metaValue}>{value}</span>
    </div>
  );
}

export function OrderDetailView({ orderId }: { orderId: number }) {
  const order = useAsync((signal) => getAdminOrder(orderId, signal), [orderId]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (order.loading) return <Spinner full />;
  if (order.error || !order.data) {
    return (
      <div className={shared.page}>
        <Alert tone="error">{order.error ?? t.common.error}</Alert>
      </div>
    );
  }

  const data = order.data;

  const changeStatus = async (value: OrderStatus) => {
    setError(null);
    setMessage(null);
    try {
      const updated = await updateOrderStatus(orderId, value);
      order.setData(updated);
      setMessage(t.admin.orders.statusUpdated);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t.common.error);
    }
  };

  const changePayment = async (value: PaymentStatus) => {
    setError(null);
    setMessage(null);
    try {
      const updated = await updateOrderPaymentStatus(orderId, value);
      order.setData(updated);
      setMessage(t.admin.orders.paymentUpdated);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t.common.error);
    }
  };

  return (
    <div className={shared.page}>
      <div className={shared.pageHeader}>
        <h1 className={shared.title}>
          {t.admin.orders.detailTitle} {data.orderNumber}
        </h1>
        <Link href="/admin/orders" className={shared.muted}>
          ← {t.admin.orders.title}
        </Link>
      </div>

      {message ? (
        <div className={shared.message}>
          <Alert tone="success">{message}</Alert>
        </div>
      ) : null}
      {error ? (
        <div className={shared.message}>
          <Alert tone="error">{error}</Alert>
        </div>
      ) : null}

      <section className={shared.card}>
        <h2 className={shared.cardTitle}>{t.admin.orders.status}</h2>
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>{t.admin.orders.updateStatus}</span>
            <select
              className={controlClass}
              value={data.status}
              onChange={(event) => changeStatus(event.target.value as OrderStatus)}
            >
              {ORDER_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {orderStatusLabel(value)}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>{t.admin.orders.updatePayment}</span>
            <select
              className={controlClass}
              value={data.paymentStatus}
              onChange={(event) => changePayment(event.target.value as PaymentStatus)}
            >
              {PAYMENT_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {paymentStatusLabel(value)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <div className={styles.grid}>
        <section className={shared.card}>
          <h2 className={shared.cardTitle}>{t.admin.orders.customerInfo}</h2>
          <Meta label={t.admin.orders.customer} value={data.customerName} />
          <Meta label={t.admin.orders.phone} value={data.phone} />
          <Meta label={t.checkout.email} value={data.email ?? "—"} />
          <Meta
            label={t.admin.orders.telegram}
            value={data.telegramUsername ? `@${data.telegramUsername}` : "—"}
          />
          <Meta label={t.admin.orders.type} value={orderTypeLabel(data.type)} />
          <Meta label={t.admin.orders.created} value={formatDateTime(data.createdAt)} />
        </section>

        <section className={shared.card}>
          <h2 className={shared.cardTitle}>{t.admin.orders.deliveryInfo}</h2>
          <Meta
            label={t.checkout.deliveryMethod}
            value={deliveryMethodLabel(data.deliveryMethod)}
          />
          <Meta
            label={t.checkout.paymentMethod}
            value={paymentMethodLabel(data.paymentMethod)}
          />
          <Meta label={t.checkout.country} value={data.country ?? "—"} />
          <Meta label={t.checkout.city} value={data.city ?? "—"} />
          <Meta label={t.checkout.address} value={data.address ?? "—"} />
          <Meta
            label={t.admin.orders.postalIndex}
            value={data.postalIndex ?? "—"}
          />
          {data.comment ? (
            <Meta label={t.admin.orders.comment} value={data.comment} />
          ) : null}
        </section>
      </div>

      <section className={shared.card}>
        <h2 className={shared.cardTitle}>{t.admin.orders.itemsTitle}</h2>
        <div className={shared.tableWrap}>
          <table className={shared.table}>
            <thead>
              <tr>
                <th>{t.admin.orders.productName}</th>
                <th>{t.admin.orders.size}</th>
                <th>{t.admin.orders.qty}</th>
                <th>{t.admin.orders.unitPrice}</th>
                <th>{t.admin.orders.lineTotal}</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={`${item.productName}-${index}`}>
                  <td>{item.productName}</td>
                  <td>{item.sizeCode ?? "—"}</td>
                  <td>{item.quantity}</td>
                  <td>{formatPrice(item.unitPrice, data.currency)}</td>
                  <td>{formatPrice(item.lineTotal, data.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.totals}>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>{t.cart.subtotal}</span>
            <span>{formatPrice(data.subtotalAmount, data.currency)}</span>
          </div>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>{t.checkout.sectionDelivery}</span>
            <span>{formatPrice(data.shippingAmount, data.currency)}</span>
          </div>
          <div className={`${styles.totalRow} ${styles.totalRowStrong}`}>
            <span className={styles.totalLabel}>{t.cart.total}</span>
            <span>{formatPrice(data.totalAmount, data.currency)}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
