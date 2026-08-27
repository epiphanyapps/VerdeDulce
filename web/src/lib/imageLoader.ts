import type { ImageLoaderProps } from "next/image";
import { imageCDNURL } from "./image";

/**
 * Custom `next/image` loader wired to the Serverless Image Handler.
 *
 * Using a loader rather than `unoptimized: true` is what keeps `srcSet`,
 * `sizes`, lazy-loading, and aspect-ratio reservation working under
 * `output: "export"` — Next generates the candidate widths and this maps each
 * one onto a CloudFront resize request.
 *
 * `src` is the S3 key (e.g. `menu/Bowl_Harvest.png`), not a URL.
 */
export default function cloudfrontLoader({ src, width }: ImageLoaderProps): string {
  // Height is intentionally omitted so the handler scales proportionally and
  // the same loader works for square cards and wide hero crops alike.
  return imageCDNURL({ key: src, width });
}
