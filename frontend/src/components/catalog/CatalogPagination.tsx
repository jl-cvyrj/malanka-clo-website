"use client";

import { Pagination } from "@/components/ui/Pagination";
import { catalogHref } from "@/lib/url";
import type { ProductSort } from "@/lib/api/types";

/**
 * Client wrapper around {@link Pagination} for the catalog. Server Components
 * cannot pass functions across the client boundary, so the page hands over
 * serializable props and this component builds the hrefs itself.
 */
export function CatalogPagination({
  page,
  totalPages,
  category,
  sort,
}: {
  page: number;
  totalPages: number;
  category?: string;
  sort: ProductSort;
}) {
  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      hrefFor={(target) => catalogHref({ category, sort, page: target })}
    />
  );
}
