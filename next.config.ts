import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: false,
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
};

export default nextConfig;
