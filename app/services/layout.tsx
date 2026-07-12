/**
 * app/services/layout.tsx
 * Server layout — injects SEO metadata and JSON-LD for /services.
 */
import { Metadata } from 'next';
import { getSeoData, buildMetadata, buildJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoData('services');
  if (!seo) return { title: 'Services | unHeard' };
  return buildMetadata(seo);
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  const seo = getSeoData('services');

  return (
    <>
      {seo && <JsonLd data={buildJsonLd(seo)} />}
      {children}
    </>
  );
}
