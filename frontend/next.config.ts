import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath: "/MedPredict",
  assetPrefix: "/MedPredict/",
  trailingSlash: true,

  env: {
    NEXT_PUBLIC_BASE_PATH: "/MedPredict",
  },
};

export default nextConfig;
