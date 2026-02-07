import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Fix for PDF.js "Can't resolve 'canvas'" error
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },

  // 2. Your existing Rewrites (Preserved)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/:path*',
      }
    ]
  }
};

export default nextConfig;