import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5000";

    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl.replace(/\/$/, "")}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5000",
      },
    ],
  },
};

export default nextConfig;
