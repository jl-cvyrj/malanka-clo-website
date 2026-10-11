import type { MetadataRoute } from "next";

/**
 * Keep the admin area and the per-user/cart flows out of search engines. The
 * admin panel is intentionally unlinked from the storefront; admins reach it by
 * navigating directly to `/admin` (see frontend/README.md).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/cart", "/checkout", "/orders"],
    },
  };
}
