"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { t } from "@/locales";
import type { Category } from "@/lib/api/types";
import styles from "./CategoryCarousel.module.css";

export interface CategoryCover {
  src: string;
}

/**
 * Background image for a card. Rendered as a plain <img> (product images are
 * user-provided external URLs) with a graceful fallback to the plain gray card
 * if the URL ever fails to load. Decorative only — the category name is its
 * own text, so the image is hidden from assistive tech.
 */
function Cover({ src }: CategoryCover) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className={styles.cardImage}
        loading="lazy"
        onError={() => setFailed(true)}
      />
      <span className={styles.cardOverlay} aria-hidden="true" />
    </>
  );
}

export function CategoryCarousel({
  categories,
  coverImages = {},
}: {
  categories: Category[];
  coverImages?: Record<string, CategoryCover>;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  const step = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(`.${styles.card}`);
    const width = card ? card.offsetWidth + 40 : track.clientWidth;
    const maxScroll = track.scrollWidth - track.clientWidth;

    if (direction === 1 && track.scrollLeft >= maxScroll - 4) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else if (direction === -1 && track.scrollLeft <= 4) {
      track.scrollTo({ left: maxScroll, behavior: "smooth" });
    } else {
      track.scrollBy({ left: direction * width, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!pausedRef.current) step(1);
    }, 3500);
    return () => window.clearInterval(id);
  }, [step]);

  if (categories.length === 0) return null;

  return (
    <div
      className={styles.wrapper}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <button
        type="button"
        className={`${styles.navButton} ${styles.navLeft}`}
        onClick={() => step(-1)}
        aria-label={t.catalog.previous}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className={styles.track} ref={trackRef} aria-label={t.nav.categories}>
        {categories.map((category) => {
          const cover = coverImages[category.slug];
          return (
            <Link
              key={category.id}
              href={`/catalog?category=${encodeURIComponent(category.slug)}`}
              className={styles.card}
            >
              {cover ? <Cover src={cover.src} /> : null}
              <span
                className={`${styles.cardName} ${cover ? styles.cardNameOnCover : ""}`}
              >
                {category.name}
              </span>
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        className={`${styles.navButton} ${styles.navRight}`}
        onClick={() => step(1)}
        aria-label={t.catalog.next}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
