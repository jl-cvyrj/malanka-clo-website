export function buildQueryString(
  params: Record<string, string | number | undefined | null>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export interface CatalogParams {
  category?: string;
  sort?: string;
  page?: number;
}

export function catalogHref({ category, sort, page }: CatalogParams): string {
  return `/catalog${buildQueryString({
    category,
    sort: sort && sort !== "newest" ? sort : undefined,
    page: page && page > 0 ? page : undefined,
  })}`;
}
