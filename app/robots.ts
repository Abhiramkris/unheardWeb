/**
 * app/robots.ts
 * Next.js Metadata Route — generates /robots.txt at build time.
 * All authenticated, internal, and admin routes are excluded from indexing.
 */
import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://unheard.in';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow:     '/',
        disallow: [
          '/admin/',
          '/super-admin/',
          '/auth/',
          '/login/',
          '/onboarding/',
          '/room/',
          '/payment/',
          '/api/',
        ],
      },
      // Block GPTBot from admin routes (extra safety layer)
      {
        userAgent: 'GPTBot',
        allow:     '/',
        disallow: [
          '/admin/',
          '/super-admin/',
          '/auth/',
          '/login/',
          '/room/',
          '/payment/',
          '/api/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host:    BASE_URL,
  };
}
