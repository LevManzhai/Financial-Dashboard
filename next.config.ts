import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Only use these settings for production builds (GitHub Pages)
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true
    },
    assetPrefix: '/Financial-Dashboard/',
    basePath: '/Financial-Dashboard'
  })
};

export default nextConfig;
