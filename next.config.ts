import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* Vercel deploys as serverless — do NOT use output:"standalone" here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
