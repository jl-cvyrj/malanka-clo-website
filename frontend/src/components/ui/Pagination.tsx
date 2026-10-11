"use client";

import Link from "next/link";
import styles from "./Pagination.module.css";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Server-side navigation (renders links). */
  hrefFor?: (page: number) => string;
  /** Client-side navigation (renders buttons). */
  onPageChange?: (page: number) => void;
}

/** Compact page list with ellipses, e.g. 1 … 4 5 6 … 12 */
function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("…");
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

export function Pagination({
  page,
  totalPages,
  hrefFor,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const current = page; // zero-based page index
  const currentNumber = current + 1;

  const renderControl = (target: number, label: string, disabled: boolean) => {
    if (hrefFor) {
      return (
        <Link
          key={label}
          href={hrefFor(target)}
          className={`${styles.link} ${disabled ? styles.disabled : ""}`}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : undefined}
        >
          {label}
        </Link>
      );
    }
    return (
      <button
        key={label}
        type="button"
        className={`${styles.link} ${disabled ? styles.disabled : ""}`}
        onClick={() => onPageChange?.(target)}
        disabled={disabled}
      >
        {label}
      </button>
    );
  };

  return (
    <nav className={styles.nav} aria-label="Pagination">
      {renderControl(current - 1, "←", current <= 0)}
      {pageWindow(currentNumber, totalPages).map((entry, index) =>
        entry === "…" ? (
          <span key={`gap-${index}`} className={styles.ellipsis}>
            …
          </span>
        ) : entry === currentNumber ? (
          <span key={entry} className={styles.current} aria-current="page">
            {entry}
          </span>
        ) : hrefFor ? (
          <Link key={entry} href={hrefFor(entry - 1)} className={styles.link}>
            {entry}
          </Link>
        ) : (
          <button
            key={entry}
            type="button"
            className={styles.link}
            onClick={() => onPageChange?.(entry - 1)}
          >
            {entry}
          </button>
        ),
      )}
      {renderControl(current + 1, "→", current >= totalPages - 1)}
    </nav>
  );
}
