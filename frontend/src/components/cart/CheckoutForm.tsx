"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, controlClass, row2Class } from "@/components/ui/Field";
import { ApiError } from "@/lib/api/client";
import { createOrder } from "@/lib/api/public";
import type {
  CreateOrderPayload,
  DeliveryMethod,
  OrderType,
  PaymentMethod,
} from "@/lib/api/types";
import {
  DELIVERY_METHODS,
  ORDER_TYPES,
  PAYMENT_METHODS,
  deliveryMethodLabel,
  formatPrice,
  orderTypeLabel,
  paymentMethodLabel,
} from "@/lib/format";
import { t } from "@/locales";
import { saveLastOrder } from "@/lib/order-storage";
import styles from "./CheckoutForm.module.css";

interface FormState {
  type: OrderType;
  customerName: string;
  phone: string;
  email: string;
  telegramUsername: string;
  postalIndex: string;
  country: string;
  city: string;
  address: string;
  deliveryMethod: DeliveryMethod | "";
  paymentMethod: PaymentMethod | "";
  comment: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEGRAM_RE = /^@?[A-Za-z0-9_]{5,32}$/;
const POSTAL_RE = /^[A-Za-z0-9][A-Za-z0-9 -]{2,19}$/;

export function CheckoutForm() {
  const router = useRouter();
  const { items, ready, subtotal, currency, clear } = useCart();
  const [form, setForm] = useState<FormState>({
    type: "DOMESTIC",
    customerName: "",
    phone: "",
    email: "",
    telegramUsername: "",
    postalIndex: "",
    country: "Беларусь",
    city: "",
    address: "",
    deliveryMethod: "BELPOST",
    paymentMethod: "FULL_PREPAYMENT",
    comment: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isDomestic = form.type === "DOMESTIC";

  const update = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!form.customerName.trim()) next.customerName = t.common.required;
    if (!form.phone.trim()) next.phone = t.common.required;
    if (form.email && !EMAIL_RE.test(form.email)) {
      next.email = t.checkout.emailInvalid;
    }
    const telegram = form.telegramUsername.trim();
    if (telegram && !TELEGRAM_RE.test(telegram)) {
      next.telegramUsername = t.checkout.telegramInvalid;
    }
    const postal = form.postalIndex.trim();
    if (postal && !POSTAL_RE.test(postal)) {
      next.postalIndex = t.checkout.postalInvalid;
    }
    if (isDomestic) {
      if (!form.city.trim()) next.city = t.common.required;
      if (!form.address.trim()) next.address = t.common.required;
      if (!postal) next.postalIndex = t.common.required;
      if (!form.deliveryMethod) next.deliveryMethod = t.common.required;
      if (!form.paymentMethod) next.paymentMethod = t.common.required;
    }
    return next;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    setErrors({});

    const payload: CreateOrderPayload = {
      type: form.type,
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      telegramUsername: form.telegramUsername.trim() || undefined,
      postalIndex: form.postalIndex.trim() || undefined,
      country: form.country.trim() || undefined,
      city: form.city.trim() || undefined,
      address: form.address.trim() || undefined,
      deliveryMethod: form.deliveryMethod || undefined,
      paymentMethod: form.paymentMethod || undefined,
      comment: form.comment.trim() || undefined,
      items: items.map((item) => ({
        productId: item.productId,
        sizeCode: item.sizeCode,
        quantity: item.quantity,
      })),
    };

    setSubmitting(true);
    try {
      const order = await createOrder(payload);
      saveLastOrder(order);
      clear();
      router.push("/orders/success");
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        setErrors(error.fieldErrors as FormErrors);
      }
      setFormError(
        error instanceof ApiError ? error.message : t.checkout.genericError,
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready) return null;

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <EmptyState title={t.checkout.emptyCart}>
            <ButtonLink href="/catalog" variant="secondary">
              {t.cart.continueShopping}
            </ButtonLink>
          </EmptyState>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>{t.checkout.title}</h1>

        <form className={styles.grid} onSubmit={handleSubmit} noValidate>
          <div>
            {formError ? (
              <div className={styles.formError}>
                <Alert tone="error">{formError}</Alert>
              </div>
            ) : null}

            <h2 className={styles.sectionTitle}>{t.checkout.sectionContact}</h2>
            <Field
              label={t.checkout.customerName}
              htmlFor="customerName"
              required
              error={errors.customerName}
            >
              <input
                id="customerName"
                name="customerName"
                className={controlClass}
                value={form.customerName}
                onChange={update}
                autoComplete="name"
                aria-invalid={Boolean(errors.customerName)}
              />
            </Field>

            <div className={row2Class}>
              <Field
                label={t.checkout.phone}
                htmlFor="phone"
                required
                error={errors.phone}
              >
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={controlClass}
                  value={form.phone}
                  onChange={update}
                  autoComplete="tel"
                  placeholder="+375291234567"
                  aria-invalid={Boolean(errors.phone)}
                />
              </Field>
              <Field
                label={t.checkout.emailOptional}
                htmlFor="email"
                error={errors.email}
              >
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={controlClass}
                  value={form.email}
                  onChange={update}
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                />
              </Field>
            </div>

            <Field
              label={t.checkout.telegramOptional}
              htmlFor="telegramUsername"
              error={errors.telegramUsername}
            >
              <input
                id="telegramUsername"
                name="telegramUsername"
                className={controlClass}
                value={form.telegramUsername}
                onChange={update}
                placeholder="@username"
                aria-invalid={Boolean(errors.telegramUsername)}
              />
            </Field>

            <h2 className={styles.sectionTitle}>{t.checkout.sectionOrder}</h2>
            <Field label={t.checkout.type} htmlFor="type" required>
              <select
                id="type"
                name="type"
                className={controlClass}
                value={form.type}
                onChange={update}
              >
                {ORDER_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {orderTypeLabel(type)}
                  </option>
                ))}
              </select>
            </Field>

            <h2 className={styles.sectionTitle}>{t.checkout.sectionDelivery}</h2>
            <div className={row2Class}>
              <Field label={t.checkout.country} htmlFor="country">
                <input
                  id="country"
                  name="country"
                  className={controlClass}
                  value={form.country}
                  onChange={update}
                  autoComplete="country-name"
                />
              </Field>
              <Field
                label={t.checkout.postalIndex}
                htmlFor="postalIndex"
                required={isDomestic}
                error={errors.postalIndex}
              >
                <input
                  id="postalIndex"
                  name="postalIndex"
                  className={controlClass}
                  value={form.postalIndex}
                  onChange={update}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="220000"
                  aria-invalid={Boolean(errors.postalIndex)}
                />
              </Field>
            </div>

            <div className={row2Class}>
              <Field
                label={t.checkout.city}
                htmlFor="city"
                required={isDomestic}
                error={errors.city}
              >
                <input
                  id="city"
                  name="city"
                  className={controlClass}
                  value={form.city}
                  onChange={update}
                  autoComplete="address-level2"
                  aria-invalid={Boolean(errors.city)}
                />
              </Field>
              <Field
                label={t.checkout.address}
                htmlFor="address"
                required={isDomestic}
                error={errors.address}
              >
                <input
                  id="address"
                  name="address"
                  className={controlClass}
                  value={form.address}
                  onChange={update}
                  autoComplete="street-address"
                  aria-invalid={Boolean(errors.address)}
                />
              </Field>
            </div>

            <div className={row2Class}>
              <Field
                label={t.checkout.deliveryMethod}
                htmlFor="deliveryMethod"
                required={isDomestic}
                error={errors.deliveryMethod}
              >
                <select
                  id="deliveryMethod"
                  name="deliveryMethod"
                  className={controlClass}
                  value={form.deliveryMethod}
                  onChange={update}
                >
                  {!isDomestic ? <option value="">—</option> : null}
                  {DELIVERY_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {deliveryMethodLabel(method)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label={t.checkout.paymentMethod}
                htmlFor="paymentMethod"
                required={isDomestic}
                error={errors.paymentMethod}
              >
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  className={controlClass}
                  value={form.paymentMethod}
                  onChange={update}
                >
                  {!isDomestic ? <option value="">—</option> : null}
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {paymentMethodLabel(method)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label={t.checkout.commentOptional} htmlFor="comment">
              <textarea
                id="comment"
                name="comment"
                className={controlClass}
                value={form.comment}
                onChange={update}
                rows={4}
              />
            </Field>
          </div>

          <aside className={styles.summary}>
            <h2 className={styles.summaryTitle}>{t.checkout.summary}</h2>
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.sizeCode}`}
                className={styles.summaryRow}
              >
                <span>
                  <span className={styles.summaryName}>{item.name}</span>
                  <span className={styles.summaryMeta}>
                    {" "}
                    · {item.sizeCode} × {item.quantity}
                  </span>
                </span>
                <span>{formatPrice(item.price * item.quantity, item.currency)}</span>
              </div>
            ))}
            <div className={styles.summaryTotal}>
              <span>{t.cart.total}</span>
              <span>{formatPrice(subtotal, currency)}</span>
            </div>

            <p className={styles.notice}>
              {isDomestic ? t.checkout.domesticOnly : t.checkout.internationalOnly}
            </p>

            <div className={styles.actions}>
              <Button type="submit" size="lg" block disabled={submitting}>
                {submitting ? t.checkout.submitting : t.checkout.submit}
              </Button>
            </div>

            <p className={styles.notice}>
              <Link href="/cart">{t.cart.title}</Link>
            </p>
          </aside>
        </form>
      </div>
    </div>
  );
}
