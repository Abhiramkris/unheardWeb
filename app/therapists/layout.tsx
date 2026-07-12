/**
 * app/therapists/layout.tsx
 * Server layout — injects SEO metadata and JSON-LD for /therapists listing.
 */
import { Metadata } from 'next';
import { getSeoData, buildMetadata, buildJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoData('therapists');
  if (!seo) return { title: 'Therapists | unHeard' };
  return buildMetadata(seo);
}

export default function TherapistsLayout({ children }: { children: React.ReactNode }) {
  const seo = getSeoData('therapists');

  return (
    <>
      {seo && <JsonLd data={buildJsonLd(seo)} />}
      {children}
    </>
  );
}
