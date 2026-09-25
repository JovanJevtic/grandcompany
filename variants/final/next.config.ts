import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // 85 for the large hero/section photographs, 75 for everything else
    qualities: [75, 85],
  },
}

export default nextConfig
