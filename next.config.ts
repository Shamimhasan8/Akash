import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Vercel deploys as serverless — do NOT use output:"standalone" here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
