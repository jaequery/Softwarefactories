import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Lets admin server actions answer 401 via `unauthorized()` (src/lib/admin/auth.ts).
  experimental: {
    authInterrupts: true,
  },
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

// Gives `next dev` the same Cloudflare bindings (env.DB → local D1 in .wrangler/state) as production.
initOpenNextCloudflareForDev();
