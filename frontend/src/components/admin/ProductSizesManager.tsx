"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, controlClass } from "@/components/ui/Field";
import { addProductSize, updateProductSize } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { ProductDetail } from "@/lib/api/types";
import {
  PRODUCT_SIZES,
  compareSizes,
  type ProductSizeCode,
} from "@/lib/constants";
import { t } from "@/locales";
import shared from "./admin.module.css";

export function ProductSizesManager({
  product,
  onUpdated,
}: {
  product: ProductDetail;
  onUpdated: (product: ProductDetail) => void;
}) {
  const [selected, setSelected] = useState<ProductSizeCode | "">("");
  const [available, setAvailable] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const used = new Set(product.sizes.map((size) => size.sizeCode.toUpperCase()));
  const options = PRODUCT_SIZES.filter((size) => !used.has(size));
  // Fall back to the first free size when the current selection is gone.
  const sizeCode = options.includes(selected as ProductSizeCode)
    ? (selected as ProductSizeCode)
    : (options[0] ?? "");

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    if (!sizeCode) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await addProductSize(product.id, sizeCode, available);
      onUpdated(updated);
      setSelected("");
      setAvailable(true);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t.common.error);
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (sizeId: number, next: boolean) => {
    setError(null);
    try {
      const updated = await updateProductSize(product.id, sizeId, next);
      onUpdated(updated);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t.common.error);
    }
  };

  const sizes = [...product.sizes].sort(compareSizes);

  return (
    <section className={shared.card}>
      <h2 className={shared.cardTitle}>{t.admin.products.sizes}</h2>

      {error ? (
        <div className={shared.message}>
          <Alert tone="error">{error}</Alert>
        </div>
      ) : null}

      {sizes.length > 0 ? (
        <div className={shared.tableWrap} style={{ marginBottom: "1.5rem" }}>
          <table className={shared.table}>
            <thead>
              <tr>
                <th>{t.admin.products.sizeCode}</th>
                <th>{t.admin.products.sizeAvailable}</th>
                <th>{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((size) => (
                <tr key={size.id}>
                  <td>{size.sizeCode}</td>
                  <td>
                    <span
                      className={`${shared.badge} ${
                        size.available ? shared.badgeActive : shared.badgeInactive
                      }`}
                    >
                      {size.available ? t.common.yes : t.common.no}
                    </span>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => toggle(size.id, !size.available)}
                    >
                      {size.available ? t.common.deactivate : t.common.activate}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {options.length === 0 ? (
        <p className={shared.hint}>{t.admin.products.allSizesAdded}</p>
      ) : (
        <form className={shared.inlineForm} onSubmit={handleAdd}>
          <Field label={t.admin.products.sizeCode} htmlFor="size-code" required>
            <select
              id="size-code"
              className={controlClass}
              value={sizeCode}
              onChange={(event) =>
                setSelected(event.target.value as ProductSizeCode)
              }
              required
            >
              {options.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </Field>
          <label
            className={shared.hint}
            style={{ display: "flex", gap: "0.5rem" }}
          >
            <input
              type="checkbox"
              checked={available}
              onChange={(event) => setAvailable(event.target.checked)}
            />
            {t.admin.products.sizeAvailable}
          </label>
          <Button type="submit" disabled={busy || !sizeCode}>
            {t.admin.products.addSize}
          </Button>
        </form>
      )}
    </section>
  );
}
