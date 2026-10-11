"use client";

import { useState } from "react";
import styles from "./ProductImage.module.css";

/**
 * Product image with a graceful placeholder when the URL is missing or broken.
 * Images are user-provided external URLs (PROJECT_PLAN D2), so a plain <img>
 * is used here instead of next/image.
 */
export function ProductImage({
  src,
  alt,
  className,
  eager = false,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`${className ?? ""} ${styles.placeholder}`}
        role="img"
        aria-label={alt}
      >
        MALANKA
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailed(true)}
    />
  );
}
