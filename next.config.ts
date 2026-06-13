import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  sassOptions: {
    includePaths: [path.join(process.cwd(), "src")],
    additionalData: `
      @use "shared/styles/vars" as *;
      @use "shared/styles/mixins" as *;
    `,
  },
  compiler: {
    styledComponents: true,
  },
  experimental: {
    esmExternals: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com",
      },
    ],
  },
};

export default nextConfig;