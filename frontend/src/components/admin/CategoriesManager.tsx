"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, controlClass } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import {
  createCategory,
  getAdminCategories,
  setCategoryActive,
  updateCategory,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { useAsync } from "@/lib/hooks/useAsync";
import type { Category, CategoryPayload } from "@/lib/api/types";
import { t } from "@/locales";
import shared from "./admin.module.css";

const EMPTY_FORM: CategoryPayload = { name: "", slug: "", sortOrder: 0 };

export function CategoriesManager() {
  const list = useAsync((signal) => getAdminCategories(signal), []);
  const [form, setForm] = useState<CategoryPayload>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      sortOrder: category.sortOrder,
    });
    setMessage(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (editingId !== null) {
        await updateCategory(editingId, form);
        setMessage(t.admin.categories.updated);
      } else {
        await createCategory(form);
        setMessage(t.admin.categories.created);
      }
      resetForm();
      list.reload();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t.common.error);
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (category: Category) => {
    setError(null);
    try {
      await setCategoryActive(category.id, !category.active);
      list.reload();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t.common.error);
    }
  };

  return (
    <div className={shared.page}>
      <div className={shared.pageHeader}>
        <h1 className={shared.title}>{t.admin.categories.title}</h1>
        <Button variant="secondary" onClick={resetForm}>
          {t.admin.categories.new}
        </Button>
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
        <h2 className={shared.cardTitle}>
          {editingId !== null
            ? t.admin.categories.edit
            : t.admin.categories.new}
        </h2>

        <div className={shared.twoCol}>
          <Field label={t.admin.categories.name} htmlFor="category-name" required>
            <input
              id="category-name"
              className={controlClass}
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              required
            />
          </Field>
          <Field label={t.admin.categories.slug} htmlFor="category-slug" required>
            <input
              id="category-slug"
              className={controlClass}
              value={form.slug}
              onChange={(event) =>
                setForm((current) => ({ ...current, slug: event.target.value }))
              }
              required
            />
          </Field>
        </div>

        <div className={shared.small}>
          <Field label={t.admin.categories.sortOrder} htmlFor="category-sort">
            <input
              id="category-sort"
              type="number"
              min={0}
              className={controlClass}
              value={form.sortOrder}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  sortOrder: Number(event.target.value) || 0,
                }))
              }
            />
          </Field>
        </div>

        <div className={shared.formActions}>
          <Button type="submit" disabled={busy}>
            {busy ? t.common.saving : editingId !== null ? t.common.save : t.common.create}
          </Button>
          {editingId !== null ? (
            <Button type="button" variant="ghost" onClick={resetForm}>
              {t.common.cancel}
            </Button>
          ) : null}
        </div>
      </form>

      {list.loading ? (
        <Spinner full />
      ) : list.error ? (
        <Alert tone="error">{list.error}</Alert>
      ) : list.data && list.data.length > 0 ? (
        <div className={shared.tableWrap}>
          <table className={shared.table}>
            <thead>
              <tr>
                <th>{t.admin.categories.name}</th>
                <th>{t.admin.categories.slug}</th>
                <th>{t.admin.categories.sortOrder}</th>
                <th>{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {list.data.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td className={shared.muted}>{category.slug}</td>
                  <td>{category.sortOrder}</td>
                  <td>
                    <div className={shared.actions}>
                      <span
                        className={`${shared.badge} ${
                          category.active ? shared.badgeActive : shared.badgeInactive
                        }`}
                      >
                        {category.active ? t.common.active : t.common.inactive}
                      </span>
                      <Button size="sm" variant="subtle" onClick={() => startEdit(category)}>
                        {t.common.edit}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => toggleActive(category)}
                      >
                        {category.active ? t.common.deactivate : t.common.activate}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title={t.admin.categories.empty} />
      )}

      <p className={shared.hint} style={{ marginTop: "1rem" }}>
        {t.admin.categories.deleteHint}
      </p>
    </div>
  );
}
