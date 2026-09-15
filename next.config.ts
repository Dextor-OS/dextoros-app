import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A package-lock.json sits in the home directory; pin the workspace root so Next ignores it.
  turbopack: { root: __dirname },
};

export default nextConfig;
