/**
 * app/contact/layout.tsx
 * Server layout — injects SEO metadata and JSON-LD for /contact.
 */
import { Metadata } from 'next';
import { getSeoData, buildMetadata, buildJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoData('contact');
  if (!seo) return { title: 'Contact | unHeard' };
  return buildMetadata(seo);
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  const seo = getSeoData('contact');

  return (
    <>
      {seo && <JsonLd data={buildJsonLd(seo)} />}
      {children}
    </>
  );
}
