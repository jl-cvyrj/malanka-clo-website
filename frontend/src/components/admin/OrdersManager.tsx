"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { controlClass } from "@/components/ui/Field";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { getAdminOrders } from "@/lib/api/admin";
import {
  ORDER_STATUSES,
  formatDateTime,
  formatPrice,
  orderStatusLabel,
  orderTypeLabel,
  paymentStatusLabel,
} from "@/lib/format";
import { useAsync } from "@/lib/hooks/useAsync";
import type { OrderStatus } from "@/lib/api/types";
import { t } from "@/locales";
import shared from "./admin.module.css";

const PAGE_SIZE = 20;

export function OrdersManager() {
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [page, setPage] = useState(0);

  const list = useAsync(
    (signal) =>
      getAdminOrders(
        { status: status || undefined, page, size: PAGE_SIZE },
        signal,
      ),
    [status, page],
  );

  return (
    <div className={shared.page}>
      <div className={shared.pageHeader}>
        <h1 className={shared.title}>{t.admin.orders.title}</h1>
        <label className={shared.inlineForm}>
          <select
            className={controlClass}
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as OrderStatus | "");
              setPage(0);
            }}
          >
            <option value="">{t.admin.orders.allStatuses}</option>
            {ORDER_STATUSES.map((value) => (
              <option key={value} value={value}>
                {orderStatusLabel(value)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {list.loading ? (
        <Spinner full />
      ) : list.error ? (
        <Alert tone="error">{list.error}</Alert>
      ) : list.data && list.data.content.length > 0 ? (
        <>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead>
                <tr>
                  <th>{t.admin.orders.number}</th>
                  <th>{t.admin.orders.customer}</th>
                  <th>{t.admin.orders.phone}</th>
                  <th>{t.admin.orders.type}</th>
                  <th>{t.admin.orders.status}</th>
                  <th>{t.admin.orders.payment}</th>
                  <th>{t.admin.orders.total}</th>
                  <th>{t.admin.orders.created}</th>
                </tr>
              </thead>
              <tbody>
                {list.data.content.map((order) => (
                  <tr key={order.id}>
                    <td className={shared.nowrap}>
                      <Link href={`/admin/orders/${order.id}`}>
                        <strong>{order.orderNumber}</strong>
                      </Link>
                    </td>
                    <td>{order.customerName}</td>
                    <td className={shared.nowrap}>{order.phone}</td>
                    <td className={shared.muted}>{orderTypeLabel(order.type)}</td>
                    <td>
                      <span className={`${shared.badge} ${shared.badgeInactive}`}>
                        {orderStatusLabel(order.status)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${shared.badge} ${
                          order.paymentStatus === "UNPAID"
                            ? shared.badgeInactive
                            : shared.badgeActive
                        }`}
                      >
                        {paymentStatusLabel(order.paymentStatus)}
                      </span>
                    </td>
                    <td className={shared.nowrap}>
                      {formatPrice(order.totalAmount, order.currency)}
                    </td>
                    <td className={shared.nowrap}>
                      {formatDateTime(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={list.data.page}
            totalPages={list.data.totalPages}
            onPageChange={setPage}
          />
        </>
      ) : (
        <EmptyState title={t.admin.orders.empty} />
      )}
    </div>
  );
}
