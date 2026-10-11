"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, controlClass } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import { ApiError } from "@/lib/api/client";
import { login, me } from "@/lib/api/admin";
import { t } from "@/locales";
import styles from "./LoginForm.module.css";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

  // If a valid session already exists, skip the form.
  useEffect(() => {
    let active = true;
    me()
      .then(() => {
        if (active) router.replace(next);
      })
      .catch(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [router, next]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      router.replace(next);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        setError(t.admin.invalidCredentials);
      } else if (caught instanceof ApiError) {
        setError(caught.message);
      } else {
        setError(t.common.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <p className={styles.brand}>MALANKA</p>
        <h1 className={styles.title}>{t.admin.loginTitle}</h1>
        <p className={styles.subtitle}>{t.admin.loginSubtitle}</p>

        {checking ? (
          <Spinner full />
        ) : (
          <form onSubmit={handleSubmit}>
            {error ? (
              <div className={styles.error}>
                <Alert tone="error">{error}</Alert>
              </div>
            ) : null}

            <Field label={t.admin.username} htmlFor="username" required>
              <input
                id="username"
                name="username"
                className={controlClass}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                autoFocus
              />
            </Field>

            <Field label={t.admin.password} htmlFor="password" required>
              <input
                id="password"
                name="password"
                type="password"
                className={controlClass}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </Field>

            <Button
              type="submit"
              size="lg"
              block
              disabled={submitting || !username || !password}
            >
              {submitting ? t.admin.signingIn : t.admin.signIn}
            </Button>
          </form>
        )}

        <Link href="/" className={styles.back}>
          ← {t.admin.nav.toStore}
        </Link>
      </div>
    </div>
  );
}
