/**
 * app/blog/layout.tsx
 * Server layout — injects SEO metadata and JSON-LD for /blog listing.
 */
import { Metadata } from 'next';
import { getSeoData, buildMetadata, buildJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoData('blog');
  if (!seo) return { title: 'Blog | unHeard' };
  return buildMetadata(seo);
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const seo = getSeoData('blog');

  return (
    <>
      {seo && <JsonLd data={buildJsonLd(seo)} />}
      {children}
    </>
  );
}
