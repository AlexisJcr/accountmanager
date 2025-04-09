import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Ignorer ESLint pendant la compilation
  },
};

export default nextConfig;