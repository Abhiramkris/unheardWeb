/**
 * app/sitemap.ts
 * Next.js Metadata Route — generates /sitemap.xml dynamically at build time.
 * Combines static routes with dynamic therapist and blog URLs from Supabase.
 */
import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { EXTRA_SEO_PAGES } from '@/lib/data/extra-seo';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://unheard.in';

// Static routes with their SEO priority and change frequency
const STATIC_ROUTES: MetadataRoute.Sitemap = [
  {
    url:            BASE_URL,
    lastModified:   new Date(),
    changeFrequency:'weekly',
    priority:       1.0,
  },
  {
    url:            `${BASE_URL}/about`,
    lastModified:   new Date(),
    changeFrequency:'monthly',
    priority:       0.8,
  },
  {
    url:            `${BASE_URL}/services`,
    lastModified:   new Date(),
    changeFrequency:'monthly',
    priority:       0.9,
  },
  {
    url:            `${BASE_URL}/therapists`,
    lastModified:   new Date(),
    changeFrequency:'weekly',
    priority:       0.9,
  },
  {
    url:            `${BASE_URL}/blog`,
    lastModified:   new Date(),
    changeFrequency:'daily',
    priority:       0.8,
  },
  {
    url:            `${BASE_URL}/contact`,
    lastModified:   new Date(),
    changeFrequency:'yearly',
    priority:       0.5,
  },
  {
    url:            `${BASE_URL}/extra-seo`,
    lastModified:   new Date(),
    changeFrequency:'monthly',
    priority:       0.8,
  },
  {
    url:            `${BASE_URL}/sitemap-page`,
    lastModified:   new Date(),
    changeFrequency:'weekly',
    priority:       0.4,
  },
  {
    url:            `${BASE_URL}/privacy`,
    lastModified:   new Date(),
    changeFrequency:'yearly',
    priority:       0.3,
  },
  {
    url:            `${BASE_URL}/refund`,
    lastModified:   new Date(),
    changeFrequency:'yearly',
    priority:       0.3,

  },
];

async function getDynamicRoutes(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // Fetch all published blog post slugs
    const { data: blogPosts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('published', true);

    const blogRoutes: MetadataRoute.Sitemap = (blogPosts ?? []).map((post) => ({
      url:            `${BASE_URL}/blog/${post.slug}`,
      lastModified:   post.updated_at ? new Date(post.updated_at) : new Date(),
      changeFrequency:'weekly' as const,
      priority:       0.7,
    }));

    // Fetch all active therapist profile IDs
    const { data: therapists } = await supabase
      .from('therapist_profiles')
      .select('user_id, updated_at')
      .eq('is_active', true);

    const therapistRoutes: MetadataRoute.Sitemap = (therapists ?? []).map((t) => ({
      url:            `${BASE_URL}/therapists/${t.user_id}`,
      lastModified:   t.updated_at ? new Date(t.updated_at) : new Date(),
      changeFrequency:'weekly' as const,
      priority:       0.8,
    }));

    return [...blogRoutes, ...therapistRoutes];
  } catch (err) {
    // Never fail the build if Supabase is unavailable
    console.warn('[sitemap] Failed to fetch dynamic routes:', err);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamicRoutes = await getDynamicRoutes();

  const extraSeoRoutes: MetadataRoute.Sitemap = EXTRA_SEO_PAGES.map((p) => ({
    url:            p.canonical,
    lastModified:   new Date(),
    changeFrequency:'weekly' as const,
    priority:       0.9,
  }));

  return [...STATIC_ROUTES, ...extraSeoRoutes, ...dynamicRoutes];
}
