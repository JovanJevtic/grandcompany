import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev only: allow opening the site via 127.0.0.1 as well as localhost
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
};

export default nextConfig;
