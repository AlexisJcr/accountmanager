import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Ignorer ESLint
  },
  experimental:{
    allowedDevOrigins: ['http://192.168.1.204'],
  },
};

export default nextConfig;