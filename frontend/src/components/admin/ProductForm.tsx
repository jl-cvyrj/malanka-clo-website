"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, controlClass } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import {
  createProduct,
  getAdminCategories,
  getAdminProduct,
  setProductActive,
  updateProduct,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import { useAsync } from "@/lib/hooks/useAsync";
import type { ProductPayload } from "@/lib/api/types";
import { t } from "@/locales";
import shared from "./admin.module.css";
import { ProductImagesManager } from "./ProductImagesManager";
import { ProductSizesManager } from "./ProductSizesManager";

const EMPTY_FORM: ProductPayload = {
  categoryId: 0,
  name: "",
  slug: "",
  description: "",
  price: 0,
  currency: DEFAULT_CURRENCY,
};

export function ProductForm({ productId }: { productId?: number }) {
  const router = useRouter();
  const isEdit = productId !== undefined;

  const categories = useAsync((signal) => getAdminCategories(signal), []);
  const product = useAsync(
    (signal) =>
      isEdit
        ? getAdminProduct(productId, signal)
        : Promise.resolve(null),
    [productId],
  );

  const [form, setForm] = useState<ProductPayload>(EMPTY_FORM);
  const [initialized, setInitialized] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Populate the form once both the product and categories are available.
  useEffect(() => {
    if (!isEdit || initialized) return;
    if (!product.data || !categories.data) return;
    const matched = categories.data.find(
      (category) => category.slug === product.data?.categorySlug,
    );
    setForm({
      categoryId: matched?.id ?? 0,
      name: product.data.name,
      slug: product.data.slug,
      description: product.data.description ?? "",
      price: product.data.price,
      currency: product.data.currency || DEFAULT_CURRENCY,
    });
    setInitialized(true);
  }, [isEdit, initialized, product.data, categories.data]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    if (!form.categoryId) {
      setError(t.admin.products.selectCategory);
      setBusy(false);
      return;
    }

    const payload: ProductPayload = {
      categoryId: form.categoryId,
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description?.trim() || undefined,
      price: Number(form.price) || 0,
      currency: form.currency?.trim() || DEFAULT_CURRENCY,
    };

    try {
      if (isEdit) {
        const updated = await updateProduct(productId, payload);
        product.setData(updated);
        setMessage(t.admin.products.updated);
      } else {
        const created = await createProduct(payload);
        router.replace(`/admin/products/${created.id}`);
      }
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t.common.error);
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async () => {
    if (!product.data) return;
    setError(null);
    try {
      const updated = await setProductActive(product.data.id, !product.data.active);
      product.setData(updated);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t.common.error);
    }
  };

  const loading = categories.loading || (isEdit && product.loading);
  if (loading) return <Spinner full />;

  if (isEdit && product.error) {
    return (
      <div className={shared.page}>
        <Alert tone="error">{product.error}</Alert>
      </div>
    );
  }

  return (
    <div className={shared.page}>
      <div className={shared.pageHeader}>
        <h1 className={shared.title}>
          {isEdit ? t.admin.products.edit : t.admin.products.new}
        </h1>
        <Link href="/admin/products" className={shared.muted}>
          ← {t.admin.products.title}
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

      <form className={`${shared.card} ${shared.form}`} onSubmit={handleSubmit}>
        <div className={shared.twoCol}>
          <Field label={t.admin.products.name} htmlFor="product-name" required>
            <input
              id="product-name"
              className={controlClass}
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              required
            />
          </Field>
          <Field label={t.admin.products.slug} htmlFor="product-slug" required>
            <input
              id="product-slug"
              className={controlClass}
              value={form.slug}
              onChange={(event) =>
                setForm((current) => ({ ...current, slug: event.target.value }))
              }
              required
            />
          </Field>
        </div>

        <div className={shared.twoCol}>
          <Field label={t.admin.products.category} htmlFor="product-category" required>
            <select
              id="product-category"
              className={controlClass}
              value={form.categoryId || ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  categoryId: Number(event.target.value) || 0,
                }))
              }
              required
            >
              <option value="">{t.admin.products.selectCategory}</option>
              {(categories.data ?? []).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {category.active ? "" : ` (${t.common.inactive})`}
                </option>
              ))}
            </select>
          </Field>
          <div className={shared.twoCol}>
            <Field label={t.admin.products.price} htmlFor="product-price" required>
              <input
                id="product-price"
                type="number"
                min={0}
                step="0.01"
                className={controlClass}
                value={form.price}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    price: Number(event.target.value) || 0,
                  }))
                }
                required
              />
            </Field>
            <Field label={t.admin.products.currency} htmlFor="product-currency">
              <input
                id="product-currency"
                maxLength={3}
                className={controlClass}
                value={form.currency}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    currency: event.target.value.toUpperCase(),
                  }))
                }
              />
            </Field>
          </div>
        </div>

        <Field label={t.admin.products.description} htmlFor="product-description">
          <textarea
            id="product-description"
            className={controlClass}
            rows={6}
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
          />
        </Field>

        <div className={shared.formActions}>
          <Button type="submit" disabled={busy}>
            {busy ? t.common.saving : isEdit ? t.common.save : t.common.create}
          </Button>
          {isEdit && product.data ? (
            <>
              <span
                className={`${shared.badge} ${
                  product.data.active ? shared.badgeActive : shared.badgeInactive
                }`}
              >
                {product.data.active ? t.common.active : t.common.inactive}
              </span>
              <Button type="button" variant="secondary" onClick={toggleActive}>
                {product.data.active ? t.common.deactivate : t.common.activate}
              </Button>
            </>
          ) : null}
        </div>
      </form>

      {isEdit && product.data ? (
        <>
          <ProductImagesManager
            product={product.data}
            onUpdated={(updated) => product.setData(updated)}
          />
          <ProductSizesManager
            product={product.data}
            onUpdated={(updated) => product.setData(updated)}
          />
        </>
      ) : null}
    </div>
  );
}
