import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  // Cache Components needs a Node server. Keep it for the normal build;
  // turn it off for the GitHub Pages static export.
  ...(isStaticExport
    ? {
        output: "export" as const,
        basePath: "/looktwice",
        assetPrefix: "/looktwice",
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {
        cacheComponents: true,
        partialPrefetching: true,
      }),
  // The preview browser loads the dev server as 127.0.0.1. Without this,
  // Next blocks the HMR socket and the page never hydrates.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
