import type { NextConfig } from "next";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          "https://bcs-backend-production-8ed4.up.railway.app/:path*",
      },
    ];
  },
};

export default nextConfig;
