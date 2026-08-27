import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Amplify Hosting serves this as plain static artifacts — the same deploy
  // model the Expo export used, with no compute to pay for or keep compatible.
  // Drop `output`/`images.unoptimized` to move onto Amplify's WEB_COMPUTE
  // platform if server rendering is ever needed.
  output: "export",
  trailingSlash: true,
  images: {
    // Menu photography is committed under public/ at display size. The
    // Serverless Image Handler this used to point at was deleted along with
    // its S3 bucket, and a static export has no optimizer of its own.
    unoptimized: true,
  },
  // The Expo app above still has its own lockfile; pin the trace root to
  // this directory so Next does not infer the parent as the workspace root.
  outputFileTracingRoot: __dirname,
  eslint: { ignoreDuringBuilds: false },
};

export default withNextIntl(nextConfig);
