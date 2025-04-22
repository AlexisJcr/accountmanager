import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/accstorage",
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental:{
    allowedDevOrigins: ['https://192.168.1.204'],
  },
};

export default nextConfig;