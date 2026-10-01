import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev only: allow opening the site via 127.0.0.1 as well as localhost
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  // "Objave" su preimenovane u "Vodiči" — stari linkovi i dalje rade.
  async redirects() {
    return [
      { source: '/objave', destination: '/vodici', permanent: true },
      { source: '/objave/:slug', destination: '/vodici/:slug', permanent: true },
    ]
  },
};

export default nextConfig;
