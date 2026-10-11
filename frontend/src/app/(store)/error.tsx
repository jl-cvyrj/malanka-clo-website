"use client";

import { Button, ButtonLink } from "@/components/ui/Button";
import { t } from "@/locales";
import styles from "./error.module.css";

/**
 * Storefront error boundary. Reached when a page throws (e.g. the backend is
 * unreachable), so shoppers get a friendly message with a retry instead of a
 * raw error screen.
 */
export default function StoreError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>{t.common.error}</h1>
      <p className={styles.text}>{t.common.errorHint}</p>
      <div className={styles.actions}>
        <Button variant="primary" onClick={reset}>
          {t.common.retry}
        </Button>
        <ButtonLink href="/" variant="secondary">
          {t.nav.home}
        </ButtonLink>
      </div>
    </div>
  );
}
