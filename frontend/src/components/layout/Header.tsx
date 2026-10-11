"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { t } from "@/locales";
import type { Category } from "@/lib/api/types";
import styles from "./Header.module.css";

export function Header({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count, ready } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setOpen(true)}
          aria-label={t.nav.openMenu}
          aria-expanded={open}
        >
          <svg className={styles.menuIcon} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className={styles.logoWrap}>
          <Link href="/" aria-label={t.meta.title}>
            <img
              src="/images/logo_original.jpg"
              alt={t.meta.title}
              className={`${styles.logo} ${scrolled ? "" : styles.logoHidden}`}
              width={120}
              height={40}
            />
          </Link>
        </div>

        <Link href="/cart" className={styles.cartLink} aria-label={t.nav.cart}>
          <svg className={styles.cartIcon} viewBox="0 0 24 24" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <span className={styles.badge} aria-hidden="true">
            {ready ? count : 0}
          </span>
          <span className={styles.srOnly}>
            {t.nav.cart}: {ready ? count : 0}
          </span>
        </Link>
      </div>

      {open ? (
        <>
          <div
            className={styles.overlay}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className={styles.drawer} aria-label={t.nav.menu}>
            <div className={styles.drawerHeader}>
              <h2 className={styles.drawerTitle}>{t.nav.menu}</h2>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setOpen(false)}
                aria-label={t.common.close}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <nav className={styles.drawerNav}>
              <Link href="/catalog" className={styles.drawerLink} onClick={() => setOpen(false)}>
                {t.nav.catalog}
              </Link>
              <Link href="/#about" className={styles.drawerLink} onClick={() => setOpen(false)}>
                {t.nav.about}
              </Link>
              <Link href="/#contacts" className={styles.drawerLink} onClick={() => setOpen(false)}>
                {t.nav.contacts}
              </Link>

              <div className={styles.categoryBlock}>
                <p className={styles.categoryLabel}>{t.nav.categories}</p>
                <div className={styles.categoryList}>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/catalog?category=${encodeURIComponent(category.slug)}`}
                      className={styles.categoryLink}
                      onClick={() => setOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </aside>
        </>
      ) : null}
    </header>
  );
}
