/**
 * app/extra-seo/[id]/layout.tsx
 * Server layout — generates full per-page SEO metadata from the data file.
 * Title, description, OG image, canonical, JSON-LD all vary by `id`.
 */
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getExtraSeoPage, EXTRA_SEO_PAGES } from '@/lib/data/extra-seo';
import { JsonLd } from '@/components/seo/JsonLd';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://unheard.in';

interface Props {
  children: React.ReactNode;
  params:   Promise<{ id: string }>;
}

// Tell Next.js to statically generate all known ids at build time
export function generateStaticParams() {
  return EXTRA_SEO_PAGES.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const page = getExtraSeoPage(id);
  if (!page) return { robots: { index: false, follow: false } };

  return {
    title:       page.metaTitle,
    description: page.metaDesc,
    keywords:    page.keywords,
    alternates:  { canonical: page.canonical },
    robots:      { index: true, follow: true },
    openGraph: {
      title:       page.metaTitle,
      description: page.metaDesc,
      url:         page.canonical,
      siteName:    'unHeard',
      locale:      'en_IN',
      type:        'website',
      images: [{ url: `${BASE_URL}/og/default.png`, width: 1200, height: 630, alt: page.metaTitle }],
    },
    twitter: {
      card:        'summary_large_image',
      title:       page.metaTitle,
      description: page.metaDesc,
      images:      [`${BASE_URL}/og/default.png`],
      site:        '@unheard_in',
    },
    other: {
      'geo.region':    'IN-KA',
      'geo.placename': 'Bengaluru, Karnataka, India',
      'geo.position':  '12.9716;77.5946',
      'ICBM':          '12.9716, 77.5946',
    },
  };
}

export default async function ExtraSeoLayout({ children, params }: Props) {
  const { id } = await params;
  const page = getExtraSeoPage(id);
  if (!page) notFound();

  const schema = [
    {
      '@context':    'https://schema.org',
      '@type':       'WebPage',
      '@id':         `${page.canonical}#webpage`,
      name:          page.metaTitle,
      description:   page.metaDesc,
      url:           page.canonical,
      inLanguage:    'en-IN',
      isPartOf:      { '@id': `${BASE_URL}/#website` },
      about:         { '@id': `${BASE_URL}/#organization` },
      keywords:      page.keywords.join(', '),
    },
    {
      '@context':    'https://schema.org',
      '@type':       'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',    item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: page.badge, item: page.canonical },
      ],
    },
    {
      '@context':         'https://schema.org',
      '@type':            'MedicalBusiness',
      name:               'unHeard',
      url:                BASE_URL,
      medicalSpecialty:   'Psychiatry',
      availableService: {
        '@type':       'MedicalTherapy',
        name:          page.metaTitle,
        description:   page.metaDesc,
        url:           page.canonical,
      },
      areaServed:         'India',
      address: {
        '@type':         'PostalAddress',
        addressLocality: 'Bengaluru',
        addressRegion:   'Karnataka',
        addressCountry:  'IN',
      },
    },
  ];

  return (
    <>
      <JsonLd data={schema} />
      {children}
    </>
  );
}
