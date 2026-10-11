import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    "192.168.1.107",
    "192.168.1.*",
    "localhost",
  ],
};

export default nextConfig;
