/**
 * Emits a JSON-LD block. Kept in one place so every structured-data payload is
 * serialised the same way, with `<` escaped to close off script-injection via
 * content fields.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
