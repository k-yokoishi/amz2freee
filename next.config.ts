import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: "/amz2freee",
  assetPrefix: "/amz2freee/",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
