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
    // Menu photography is already resized and cached by the Serverless Image
    // Handler in front of the S3 bucket. A custom loader points next/image at
    // it, which keeps srcSet, sizes and lazy-loading working under a static
    // export instead of falling back to `unoptimized`.
    loader: "custom",
    loaderFile: "./src/lib/imageLoader.ts",
    // Candidate widths Next may request from the handler.
    imageSizes: [200, 320, 420],
    deviceSizes: [480, 640, 828, 1080, 1200, 1920],
  },
  // The Expo app above still has its own lockfile; pin the trace root to
  // this directory so Next does not infer the parent as the workspace root.
  outputFileTracingRoot: __dirname,
  eslint: { ignoreDuringBuilds: false },
};

export default withNextIntl(nextConfig);
