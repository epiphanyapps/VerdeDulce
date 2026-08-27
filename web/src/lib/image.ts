/**
 * URL builder for the Serverless Image Handler (CloudFront + Lambda) sitting in
 * front of the menu-pictures S3 prefix. Ported from `app/utils/linkbuilder.ts`.
 *
 * The handler takes a base64-encoded JSON request as the path, so a URL is
 * fully derivable at build time — which is what lets the menu pages stay static.
 */
const CDN_ORIGIN = "https://d1y88dmezll7at.cloudfront.net";

/**
 * The image handler is bound to this bucket. It is deliberately a literal
 * rather than a read of `amplify_outputs.json`: the outputs file is regenerated
 * per branch, and pointing the CDN at a different bucket silently breaks every
 * image. Override per environment with NEXT_PUBLIC_IMAGE_BUCKET.
 */
const BUCKET =
  process.env.NEXT_PUBLIC_IMAGE_BUCKET ??
  "amplify-d1ptvrvloahojd-ma-dulcedrivebucketa0ac03f2-yskoeldyixir";

type Fit = "cover" | "contain" | "fill" | "inside" | "outside";

export type ImageRequest = {
  /** Key within the bucket, e.g. `menu/Bowl_Harvest.png`. */
  key: string;
  /** Omit both width and height to serve the original, unresized. */
  width?: number;
  height?: number;
  fit?: Fit;
  moderated?: boolean;
};

/** base64 that works in both the Node build and the browser. */
function encode(value: string): string {
  return typeof window === "undefined"
    ? Buffer.from(value, "utf8").toString("base64")
    : window.btoa(unescape(encodeURIComponent(value)));
}

export function imageCDNURL({
  key,
  width,
  height,
  fit = "cover",
  moderated = false,
}: ImageRequest): string {
  const edits: Record<string, unknown> = { contentModeration: moderated };
  if (width || height) edits.resize = { width, height, fit };

  return `${CDN_ORIGIN}/${encode(JSON.stringify({ bucket: BUCKET, key, edits }))}`;
}

/**
 * Widths emitted into `srcSet` for menu photography. The card grid tops out
 * around 460 CSS px per column, so 960 covers a 2x display without overshooting.
 */
export const MENU_IMAGE_WIDTHS = [320, 480, 640, 960] as const;

/** Builds a `srcSet` so the browser picks a size instead of always taking the largest. */
export function menuImageSrcSet(key: string): string {
  return MENU_IMAGE_WIDTHS.map(
    (w) => `${imageCDNURL({ key, width: w, height: w })} ${w}w`,
  ).join(", ");
}
