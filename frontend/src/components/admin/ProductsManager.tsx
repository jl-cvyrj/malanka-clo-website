"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { getAdminProducts, setProductActive } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { formatPrice } from "@/lib/format";
import { useAsync } from "@/lib/hooks/useAsync";
import type { ProductSummary } from "@/lib/api/types";
import { t } from "@/locales";
import shared from "./admin.module.css";

const PAGE_SIZE = 20;

export function ProductsManager() {
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const list = useAsync(
    (signal) => getAdminProducts({ page, size: PAGE_SIZE }, signal),
    [page],
  );

  const toggleActive = async (product: ProductSummary) => {
    setError(null);
    try {
      await setProductActive(product.id, !product.active);
      list.reload();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t.common.error);
    }
  };

  return (
    <div className={shared.page}>
      <div className={shared.pageHeader}>
        <h1 className={shared.title}>{t.admin.products.title}</h1>
        <ButtonLink href="/admin/products/new">{t.admin.products.new}</ButtonLink>
      </div>

      {error ? (
        <div className={shared.message}>
          <Alert tone="error">{error}</Alert>
        </div>
      ) : null}

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
                  <th />
                  <th>{t.admin.products.name}</th>
                  <th>{t.admin.products.category}</th>
                  <th>{t.admin.products.price}</th>
                  <th>{t.admin.products.status}</th>
                  <th>{t.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {list.data.content.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <ProductImage
                        src={product.primaryImageUrl}
                        alt={product.name}
                        className={shared.thumb}
                      />
                    </td>
                    <td>
                      <Link href={`/admin/products/${product.id}`}>
                        <strong>{product.name}</strong>
                      </Link>
                      <div className={shared.muted}>{product.slug}</div>
                    </td>
                    <td className={shared.muted}>{product.categoryName}</td>
                    <td className={shared.nowrap}>
                      {formatPrice(product.price, product.currency)}
                    </td>
                    <td>
                      <span
                        className={`${shared.badge} ${
                          product.active ? shared.badgeActive : shared.badgeInactive
                        }`}
                      >
                        {product.active ? t.common.active : t.common.inactive}
                      </span>
                    </td>
                    <td>
                      <div className={shared.actions}>
                        <ButtonLink
                          href={`/admin/products/${product.id}`}
                          size="sm"
                          variant="subtle"
                        >
                          {t.common.edit}
                        </ButtonLink>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => toggleActive(product)}
                        >
                          {product.active ? t.common.deactivate : t.common.activate}
                        </Button>
                      </div>
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
        <EmptyState title={t.admin.products.empty}>
          <ButtonLink href="/admin/products/new">
            {t.admin.products.new}
          </ButtonLink>
        </EmptyState>
      )}
    </div>
  );
}
