"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, controlClass } from "@/components/ui/Field";
import { ProductImage } from "@/components/product/ProductImage";
import { addProductImage, removeProductImage, reorderProductImage } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { ProductDetail } from "@/lib/api/types";
import { t } from "@/locales";
import shared from "./admin.module.css";
import styles from "./ProductImagesManager.module.css";

export function ProductImagesManager({
  product,
  onUpdated,
}: {
  product: ProductDetail;
  onUpdated: (product: ProductDetail) => void;
}) {
  const [url, setUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const images = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    if (!url.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await addProductImage(product.id, {
        url: url.trim(),
        altText: altText.trim() || undefined,
        sortOrder: images.length,
      });
      onUpdated(updated);
      setUrl("");
      setAltText("");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t.common.error);
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (imageId: number) => {
    setError(null);
    try {
      const updated = await removeProductImage(product.id, imageId);
      onUpdated(updated);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t.common.error);
    }
  };

  const handleMove = async (imageId: number, direction: -1 | 1) => {
    const index = images.findIndex((image) => image.id === imageId);
    const swapIndex = index + direction;
    if (index < 0 || swapIndex < 0 || swapIndex >= images.length) return;
    const current = images[index];
    const neighbour = images[swapIndex];
    setError(null);
    try {
      await reorderProductImage(product.id, current.id, neighbour.sortOrder);
      const updated = await reorderProductImage(
        product.id,
        neighbour.id,
        current.sortOrder,
      );
      onUpdated(updated);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t.common.error);
    }
  };

  return (
    <section className={shared.card}>
      <h2 className={shared.cardTitle}>{t.admin.products.images}</h2>
      <p className={shared.hint} style={{ marginBottom: "1rem" }}>
        {t.admin.products.imagesHint}
      </p>

      {error ? (
        <div className={shared.message}>
          <Alert tone="error">{error}</Alert>
        </div>
      ) : null}

      {images.length > 0 ? (
        <div className={shared.tableWrap} style={{ marginBottom: "1.5rem" }}>
          <table className={shared.table}>
            <thead>
              <tr>
                <th>{t.admin.products.imageUrl}</th>
                <th>{t.admin.products.imageAlt}</th>
                <th>{t.admin.products.imageSort}</th>
                <th>{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {images.map((image, index) => (
                <tr key={image.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <ProductImage
                        src={image.url}
                        alt={image.altText ?? product.name}
                        className={styles.thumb}
                      />
                      <span className={shared.muted} style={{ wordBreak: "break-all" }}>
                        {image.url}
                      </span>
                    </div>
                  </td>
                  <td className={shared.muted}>{image.altText ?? "—"}</td>
                  <td>{image.sortOrder}</td>
                  <td>
                    <div className={shared.actions}>
                      <Button
                        size="sm"
                        variant="subtle"
                        onClick={() => handleMove(image.id, -1)}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        size="sm"
                        variant="subtle"
                        onClick={() => handleMove(image.id, 1)}
                        disabled={index === images.length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleRemove(image.id)}
                      >
                        {t.admin.products.removeImage}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <form className={shared.twoCol} onSubmit={handleAdd}>
        <Field label={t.admin.products.imageUrl} htmlFor="image-url" required>
          <input
            id="image-url"
            className={controlClass}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://…"
            required
          />
        </Field>
        <Field label={t.admin.products.imageAlt} htmlFor="image-alt">
          <input
            id="image-alt"
            className={controlClass}
            value={altText}
            onChange={(event) => setAltText(event.target.value)}
          />
        </Field>
        <div className={shared.formActions}>
          <Button type="submit" disabled={busy || !url.trim()}>
            {t.admin.products.addImage}
          </Button>
        </div>
      </form>
    </section>
  );
}
