import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn-img-v2.mybota.vn',
      },
    ],
  },
};

export default nextConfig;
