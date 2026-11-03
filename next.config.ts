import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // /ads/parcel-loop opens the playable's browser build from public/ads/parcel-loop/index.html.
  async rewrites() {
    return [{ source: "/ads/:game", destination: "/ads/:game/index.html" }];
  },
  // Keep the playable ads out of search results.
  async headers() {
    return [{ source: "/ads/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] }];
  },
};

export default nextConfig;
