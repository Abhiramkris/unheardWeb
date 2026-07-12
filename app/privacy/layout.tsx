/**
 * app/privacy/layout.tsx
 * Server layout — injects SEO metadata and JSON-LD for /privacy.
 */
import { Metadata } from 'next';
import { getSeoData, buildMetadata, buildJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoData('privacy');
  if (!seo) return { title: 'Privacy Policy | unHeard' };
  return buildMetadata(seo);
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  const seo = getSeoData('privacy');

  return (
    <>
      {seo && <JsonLd data={buildJsonLd(seo)} />}
      {children}
    </>
  );
}
