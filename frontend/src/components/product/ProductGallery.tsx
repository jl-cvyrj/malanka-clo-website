"use client";

import { useState } from "react";
import type { ProductImage as ProductImageType } from "@/lib/api/types";
import { ProductImage } from "./ProductImage";
import styles from "./ProductGallery.module.css";

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImageType[];
  productName: string;
}) {
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = sorted[activeIndex];

  return (
    <div className={styles.wrap}>
      <div className={styles.main}>
        <ProductImage
          src={active?.url}
          alt={active?.altText ?? productName}
          className={styles.mainImage}
          eager
        />
      </div>

      {sorted.length > 1 ? (
        <div className={styles.thumbs}>
          {sorted.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className={`${styles.thumb} ${
                index === activeIndex ? styles.thumbActive : ""
              }`}
              onClick={() => setActiveIndex(index)}
              aria-label={`${productName} ${index + 1}`}
              aria-current={index === activeIndex}
            >
              <ProductImage
                src={image.url}
                alt={image.altText ?? productName}
                className={styles.thumbImage}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
