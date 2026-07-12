/**
 * lib/seo.ts
 * ----------
 * Typed SEO utility — reads per-route JSON from `seo/` and converts to
 * Next.js Metadata objects + JSON-LD structured data.
 */

import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GeoData {
  region:    string;
  placename: string;
  position:  string;
  icbm:      string;
}

export interface SeoData {
  title:       string;
  description: string;
  keywords:    string[];
  ogImage:     string;
  canonical:   string;
  noindex:     boolean;
  geo:         GeoData;
  schema:      Record<string, unknown>[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://unheard.in';
const SEO_DIR  = path.join(process.cwd(), 'seo');

// ─── Data Loader ─────────────────────────────────────────────────────────────

/**
 * Reads `seo/<route>.json` from disk.
 * Falls back gracefully if file missing (e.g. dynamic routes that don't have a static JSON).
 */
export function getSeoData(route: string): SeoData | null {
  try {
    const filePath = path.join(SEO_DIR, `${route}.json`);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as SeoData;
  } catch {
    return null;
  }
}

// ─── Metadata Builder ────────────────────────────────────────────────────────

/**
 * Converts a SeoData object into a Next.js Metadata object.
 * Handles Open Graph, Twitter Cards, canonical URL, robots, and keywords.
 */
export function buildMetadata(
  seoData: SeoData,
  overrides: Partial<SeoData> = {},
): Metadata {
  const d = { ...seoData, ...overrides };

  return {
    title:       d.title,
    description: d.description,
    keywords:    d.keywords,
    alternates: {
      canonical: d.canonical,
    },
    robots: d.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title:       d.title,
      description: d.description,
      url:         d.canonical,
      siteName:    'unHeard',
      locale:      'en_IN',
      type:        'website',
      images: [
        {
          url:    d.ogImage,
          width:  1200,
          height: 630,
          alt:    d.title,
        },
      ],
    },
    twitter: {
      card:        'summary_large_image',
      title:       d.title,
      description: d.description,
      images:      [d.ogImage],
      site:        '@unheard_in',
      creator:     '@unheard_in',
    },
    other: {
      // Geo meta tags
      'geo.region':    d.geo.region,
      'geo.placename': d.geo.placename,
      'geo.position':  d.geo.position,
      'ICBM':          d.geo.icbm,
    },
  };
}

// ─── JSON-LD Builder ─────────────────────────────────────────────────────────

/**
 * Returns the JSON-LD schema array from SeoData,
 * with optional additional schema objects merged in.
 */
export function buildJsonLd(
  seoData: SeoData,
  extra: Record<string, unknown>[] = [],
): Record<string, unknown>[] {
  return [...(seoData.schema ?? []), ...extra];
}

// ─── Dynamic Page Helpers ────────────────────────────────────────────────────

/** Build metadata for a blog article page (uses runtime data, not a static JSON). */
export function buildArticleMetadata(opts: {
  title:       string;
  description: string;
  slug:        string;
  ogImage?:    string;
  publishedAt?: string;
  author?:     string;
}): Metadata {
  const canonical = `${BASE_URL}/blog/${opts.slug}`;
  const image     = opts.ogImage ?? `${BASE_URL}/og/blog.png`;

  return {
    title:       `${opts.title} | unHeard Blog`,
    description: opts.description,
    alternates:  { canonical },
    robots:      { index: true, follow: true },
    openGraph: {
      title:       opts.title,
      description: opts.description,
      url:         canonical,
      siteName:    'unHeard',
      locale:      'en_IN',
      type:        'article',
      images: [{ url: image, width: 1200, height: 630, alt: opts.title }],
      ...(opts.publishedAt ? { publishedTime: opts.publishedAt } : {}),
      ...(opts.author      ? { authors: [opts.author]            } : {}),
    },
    twitter: {
      card:   'summary_large_image',
      title:  opts.title,
      images: [image],
      site:   '@unheard_in',
    },
  };
}

/** Build metadata for a therapist profile page (uses runtime data). */
export function buildTherapistMetadata(opts: {
  id:          string;
  name:        string;
  bio:         string;
  specialty?:  string;
  avatarUrl?:  string;
}): Metadata {
  const canonical = `${BASE_URL}/therapists/${opts.id}`;
  const image     = opts.avatarUrl ?? `${BASE_URL}/og/therapists.png`;
  const title     = `${opts.name} — Therapist | unHeard`;
  const desc      = opts.bio.slice(0, 155) + (opts.bio.length > 155 ? '…' : '');

  return {
    title,
    description: desc,
    alternates:  { canonical },
    robots:      { index: true, follow: true },
    openGraph: {
      title,
      description: desc,
      url:         canonical,
      siteName:    'unHeard',
      locale:      'en_IN',
      type:        'profile',
      images: [{ url: image, width: 400, height: 400, alt: opts.name }],
    },
    twitter: {
      card:   'summary',
      title,
      images: [image],
      site:   '@unheard_in',
    },
  };
}

/** Build JSON-LD Article schema for a blog post. */
export function buildArticleSchema(opts: {
  title:       string;
  description: string;
  slug:        string;
  ogImage?:    string;
  publishedAt?: string;
  author?:     string;
}): Record<string, unknown>[] {
  const canonical = `${BASE_URL}/blog/${opts.slug}`;
  return [
    {
      '@context':         'https://schema.org',
      '@type':            'Article',
      headline:           opts.title,
      description:        opts.description,
      url:                canonical,
      image:              opts.ogImage ?? `${BASE_URL}/og/blog.png`,
      datePublished:      opts.publishedAt ?? new Date().toISOString(),
      publisher: {
        '@type': 'Organization',
        name:    'unHeard',
        logo: {
          '@type': 'ImageObject',
          url:     `${BASE_URL}/assets/logo unherd white.svg`,
        },
      },
      ...(opts.author ? {
        author: { '@type': 'Person', name: opts.author },
      } : {}),
    },
    {
      '@context':    'https://schema.org',
      '@type':       'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog` },
        { '@type': 'ListItem', position: 3, name: opts.title, item: canonical },
      ],
    },
  ];
}

/** Build JSON-LD Person schema for a therapist profile. */
export function buildTherapistSchema(opts: {
  id:           string;
  name:         string;
  bio:          string;
  specialty?:   string;
  avatarUrl?:   string;
  qualification?: string;
}): Record<string, unknown>[] {
  const canonical = `${BASE_URL}/therapists/${opts.id}`;
  return [
    {
      '@context':    'https://schema.org',
      '@type':       'Person',
      '@id':         `${canonical}#person`,
      name:          opts.name,
      description:   opts.bio,
      image:         opts.avatarUrl ?? `${BASE_URL}/og/therapists.png`,
      url:           canonical,
      jobTitle:      opts.specialty ?? 'Therapist',
      worksFor:      { '@id': `${BASE_URL}/#organization` },
      ...(opts.qualification ? { hasCredential: opts.qualification } : {}),
    },
    {
      '@context':    'https://schema.org',
      '@type':       'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',       item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Therapists', item: `${BASE_URL}/therapists` },
        { '@type': 'ListItem', position: 3, name: opts.name,    item: canonical },
      ],
    },
  ];
}
