import type { NextConfig } from "next";
import { MEDIA_STORAGE } from "./src/features/media/config";

const nextConfig: NextConfig = {
  agentRules: false,
  experimental: {
    serverActions: {
      bodySizeLimit: `${Math.round(MEDIA_STORAGE.maxFileSizeBytes / (1024 * 1024))}mb`,
    },
  },
};

export default nextConfig;
