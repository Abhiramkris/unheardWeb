/**
 * components/seo/JsonLd.tsx
 * -------------------------
 * Server Component that renders one or more JSON-LD <script> blocks in <head>.
 * Import this in page.tsx or layout.tsx files (server components only).
 */

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Renders structured data as <script type="application/ld+json">.
 * Accepts a single schema object or an array (renders one <script> per item).
 */
export function JsonLd({ data }: JsonLdProps) {
  const items = Array.isArray(data) ? data : [data];

  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          // JSON.stringify with null replacer + 0 spacing for compact inline output
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
