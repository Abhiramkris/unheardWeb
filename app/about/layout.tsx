/**
 * app/about/layout.tsx
 * Server layout — injects SEO metadata and JSON-LD for /about.
 * The page itself is 'use client' so we handle metadata here.
 */
import { Metadata } from 'next';
import { getSeoData, buildMetadata, buildJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoData('about');
  if (!seo) return { title: 'About | unHeard' };
  return buildMetadata(seo);
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  const seo = getSeoData('about');

  return (
    <>
      {seo && <JsonLd data={buildJsonLd(seo)} />}
      {children}
    </>
  );
}
