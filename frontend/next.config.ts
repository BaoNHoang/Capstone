import type { NextConfig } from "next";

const repo = "MedPredict";
const isGithubPages = process.env.GITHUB_PAGES === "true";
const apiBase = process.env.INTERNAL_API_BASE || "http://backend:8000";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,

  ...(isGithubPages
    ? {
        output: "export" as const,
        basePath: `/${repo}`,
        assetPrefix: `/${repo}/`,
      }
    : {}),

  async rewrites() {
    if (isGithubPages) return [];

    return [
      {
        source: "/api/:path*",
        destination: `${apiBase}/:path*`,
      },
    ];
  },

  env: {
    NEXT_PUBLIC_BASE_PATH: isGithubPages ? `/${repo}` : "",
  },
};

export default nextConfig;