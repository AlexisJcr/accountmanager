import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental:{
    allowedDevOrigins: ['https://192.168.1.204'],
  },
};

export default nextConfig;