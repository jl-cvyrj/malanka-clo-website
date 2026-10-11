import type { NextConfig } from "next";

/**
 * Backend origin used by the `/api` proxy below. In production set
 * `BACKEND_ORIGIN=https://<backend-host>`; locally it falls back to the public
 * base URL (or `http://localhost:8080`).
 */
const backendOrigin =
  process.env.BACKEND_ORIGIN ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["192.168.1.107", "192.168.1.*", "localhost"],
  // Proxy API calls to the Spring Boot backend so the browser only ever talks
  // to this origin: no CORS, and the session/CSRF cookies stay first-party
  // (readable by the admin SPA).
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
