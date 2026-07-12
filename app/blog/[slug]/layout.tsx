/**
 * app/blog/[slug]/layout.tsx
 * Dynamic server layout — fetches blog post data server-side and injects
 * rich Article + BreadcrumbList JSON-LD and Open Graph article metadata.
 */
import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { buildArticleMetadata, buildArticleSchema } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

interface LayoutProps {
  children: React.ReactNode;
  params:   Promise<{ slug: string }>;
}

async function getBlogPost(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data } = await supabase
    .from('blog_posts')
    .select('slug, title, description, cover_image, published_at, author_name')
    .eq('slug', slug)
    .single();

  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return { title: 'Article | unHeard Blog', robots: { index: false, follow: false } };
  }

  return buildArticleMetadata({
    title:       post.title,
    description: post.description ?? '',
    slug:        post.slug,
    ogImage:     post.cover_image,
    publishedAt: post.published_at,
    author:      post.author_name,
  });
}

export default async function BlogPostLayout({ children, params }: LayoutProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  const schema = post
    ? buildArticleSchema({
        title:       post.title,
        description: post.description ?? '',
        slug:        post.slug,
        ogImage:     post.cover_image,
        publishedAt: post.published_at,
        author:      post.author_name,
      })
    : [];

  return (
    <>
      {schema.length > 0 && <JsonLd data={schema} />}
      {children}
    </>
  );
}
