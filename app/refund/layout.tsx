/**
 * app/refund/layout.tsx
 * Server layout — injects SEO metadata and JSON-LD for /refund.
 */
import { Metadata } from 'next';
import { getSeoData, buildMetadata, buildJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoData('refund');
  if (!seo) return { title: 'Refund Policy | unHeard' };
  return buildMetadata(seo);
}

export default function RefundLayout({ children }: { children: React.ReactNode }) {
  const seo = getSeoData('refund');

  return (
    <>
      {seo && <JsonLd data={buildJsonLd(seo)} />}
      {children}
    </>
  );
}
