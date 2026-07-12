/**
 * app/sitemap-page/page.tsx
 * ─────────────────────────
 * Visual HTML sitemap at /sitemap-page  (Next.js reserves /sitemap for the XML route)
 * Dynamically fetches live blog posts + therapist profiles from Supabase.
 * Server Component — renders fully at request time, always up to date.
 */
import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { EXTRA_SEO_PAGES } from '@/lib/data/extra-seo';

export const dynamic   = 'force-dynamic'; // always fresh
export const revalidate = 0;

export const metadata: Metadata = {
  title:       'Sitemap | unHeard',
  description: 'Complete sitemap of unHeard — all pages, therapy guides, blog posts, and therapist profiles.',
  alternates:  { canonical: 'https://unheard.in/sitemap-page' },
  robots:      { index: true, follow: true },
};

const BASE = 'https://unheard.in';

// ─── Data types ─────────────────────────────────────────────────────────────

interface BlogPost {
  slug:       string;
  title:      string;
  created_at: string;
  published:  boolean;
}

interface TherapistProfile {
  user_id:    string;
  full_name:  string;
  specialties: string[];
}

// ─── Supabase fetcher (safe — never throws) ──────────────────────────────────

async function fetchDynamicData() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const [{ data: blogs }, { data: therapists }] = await Promise.all([
      supabase
        .from('blogs')
        .select('slug, title, created_at, published')
        .eq('published', true)
        .order('created_at', { ascending: false }),
      supabase
        .from('therapist_profiles')
        .select('user_id, full_name, specialties')
        .order('full_name', { ascending: true }),
    ]);

    return {
      blogs:      (blogs      ?? []) as BlogPost[],
      therapists: (therapists ?? []) as TherapistProfile[],
    };
  } catch {
    return { blogs: [], therapists: [] };
  }
}

// ─── UI atoms ────────────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  label,
  count,
  accent = '#0F9393',
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/8">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
          style={{ background: `${accent}25`, border: `1px solid ${accent}30` }}
        >
          {icon}
        </div>
        <h2 className="font-georgia text-[18px] font-bold text-white">{label}</h2>
      </div>
      {count !== undefined && (
        <span
          className="font-nunito text-[12px] font-bold px-2.5 py-0.5 rounded-full"
          style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}25` }}
        >
          {count}
        </span>
      )}
    </div>
  );
}

function PageRow({
  href,
  label,
  sub,
  external = false,
}: {
  href:      string;
  label:     string;
  sub?:      string;
  external?: boolean;
}) {
  const Inner = () => (
    <div className="flex items-start justify-between gap-4 py-3 px-4 rounded-[12px] hover:bg-white/[0.05] transition-all group cursor-pointer">
      <div className="flex items-start gap-3 min-w-0">
        <svg
          className="flex-shrink-0 mt-1 text-white/20 group-hover:text-[#0F9393] transition-colors"
          width="12" height="12" viewBox="0 0 12 12" fill="none"
        >
          <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="min-w-0">
          <p className="font-nunito font-semibold text-[14px] text-white/75 group-hover:text-white transition-colors leading-snug truncate">
            {label}
          </p>
          {sub && (
            <p className="font-nunito text-[12px] text-white/35 mt-0.5 truncate">{sub}</p>
          )}
        </div>
      </div>
      <span className="flex-shrink-0 font-nunito text-[11px] text-white/25 font-mono mt-0.5 hidden sm:block">
        {href.replace('https://unheard.in', '')}
      </span>
    </div>
  );

  if (external) {
    return <a href={href} target="_blank" rel="noopener noreferrer"><Inner /></a>;
  }
  return <Link href={href.replace(BASE, '')}><Inner /></Link>;
}

// ─── Static page definitions ─────────────────────────────────────────────────

const CORE_PAGES = [
  { href: `${BASE}/`,            label: 'Home',                    sub: 'Landing page & overview' },
  { href: `${BASE}/about`,       label: 'About unHeard',           sub: 'Mission, story, team' },
  { href: `${BASE}/services`,    label: 'Services',                sub: 'All therapy services offered' },
  { href: `${BASE}/therapists`,  label: 'Find a Therapist',        sub: 'Browse all licensed therapists' },
  { href: `${BASE}/blog`,        label: 'Blog',                    sub: 'Mental health articles & insights' },
  { href: `${BASE}/contact`,     label: 'Contact',                 sub: 'Get in touch' },
];

const LEGAL_PAGES = [
  { href: `${BASE}/privacy`, label: 'Privacy Policy',    sub: 'How we protect your data' },
  { href: `${BASE}/refund`,  label: 'Refund Policy',     sub: 'Session cancellation & refund terms' },
];

const TOOL_PAGES = [
  { href: `${BASE}/sitemap-page`,   label: 'Sitemap',         sub: 'This page' },
  { href: `${BASE}/sitemap.xml`,    label: 'XML Sitemap',     sub: 'Machine-readable sitemap for search engines' },
  { href: `${BASE}/robots.txt`,     label: 'robots.txt',      sub: 'Crawler directives' },
  { href: `${BASE}/llms.txt`,       label: 'llms.txt',        sub: 'AI crawler guidelines' },
  { href: `${BASE}/ai-metadata.json`,label: 'ai-metadata.json',sub: 'Structured metadata for AI systems' },
];

const BANG_PAGES  = EXTRA_SEO_PAGES.filter(p => p.category === 'bangalore');
const COND_PAGES  = EXTRA_SEO_PAGES.filter(p => p.category === 'condition');
const AWARE_PAGES = EXTRA_SEO_PAGES.filter(p => p.category === 'awareness');

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function SitemapPage() {
  const { blogs, therapists } = await fetchDynamicData();
  const totalPages = CORE_PAGES.length + LEGAL_PAGES.length + TOOL_PAGES.length
    + EXTRA_SEO_PAGES.length + blogs.length + therapists.length + 1; // +1 for /extra-seo hub

  return (
    <main className="min-h-screen bg-[#111111] text-white">

      {/* ── Header ── */}
      <div className="w-full border-b border-white/6">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-4 flex items-center gap-2 font-nunito text-[13px] text-white/35">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-white/60">Sitemap</span>
        </div>
      </div>

      <section className="max-w-[1200px] mx-auto px-6 md:px-12 pt-14 pb-10">
        <p className="font-nunito text-[11px] font-bold tracking-widest uppercase text-[#0F9393] mb-3">
          Site Structure
        </p>
        <h1 className="font-georgia text-[36px] md:text-[50px] font-bold text-white leading-[1.1] mb-4">
          Sitemap
        </h1>
        <p className="font-nunito text-[16px] text-white/45 max-w-[560px] leading-relaxed mb-3">
          Every page on unHeard — dynamically updated. {totalPages} pages total, including live blog posts and therapist profiles.
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          {[
            { label: `${CORE_PAGES.length + LEGAL_PAGES.length} Core pages`,   color: '#0F9393' },
            { label: `${EXTRA_SEO_PAGES.length} SEO guides`,                    color: '#a78bfa' },
            { label: `${blogs.length} Blog posts`,                              color: '#f59e0b' },
            { label: `${therapists.length} Therapists`,                         color: '#34d399' },
          ].map((chip) => (
            <span
              key={chip.label}
              className="font-nunito text-[12px] font-bold px-3 py-1 rounded-full"
              style={{ background: `${chip.color}18`, color: chip.color, border: `1px solid ${chip.color}28` }}
            >
              {chip.label}
            </span>
          ))}
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── Core Pages ── */}
          <div className="bg-white/[0.03] border border-white/8 rounded-[24px] p-6">
            <SectionHeader
              label="Core Pages"
              count={CORE_PAGES.length}
              accent="#0F9393"
              icon={
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7l6-6 6 6M2.5 5.5V12a.5.5 0 00.5.5h3V9h2v3.5h3a.5.5 0 00.5-.5V5.5" stroke="#0F9393" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
            />
            {CORE_PAGES.map((p) => <PageRow key={p.href} {...p} />)}
          </div>

          {/* ── Legal + Tools ── */}
          <div className="flex flex-col gap-8">
            <div className="bg-white/[0.03] border border-white/8 rounded-[24px] p-6">
              <SectionHeader
                label="Legal"
                count={LEGAL_PAGES.length}
                accent="#94a3b8"
                icon={
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="2" y="1" width="10" height="12" rx="1.5" stroke="#94a3b8" strokeWidth="1.3"/>
                    <path d="M4.5 4.5h5M4.5 7h5M4.5 9.5h3" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                }
              />
              {LEGAL_PAGES.map((p) => <PageRow key={p.href} {...p} />)}
            </div>

            <div className="bg-white/[0.03] border border-white/8 rounded-[24px] p-6">
              <SectionHeader
                label="Technical & AI"
                count={TOOL_PAGES.length}
                accent="#64748b"
                icon={
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 4l3 3-3 3M7 10h5" stroke="#64748b" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                }
              />
              {TOOL_PAGES.map((p) => (
                <PageRow key={p.href} href={p.href} label={p.label} sub={p.sub} external={p.href.endsWith('.xml') || p.href.endsWith('.txt') || p.href.endsWith('.json')} />
              ))}
            </div>
          </div>

          {/* ── Guides Hub ── */}
          <div className="bg-white/[0.03] border border-white/8 rounded-[24px] p-6 lg:col-span-2">
            <SectionHeader
              label="Mental Health Guides Hub"
              accent="#0F9393"
              icon={
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5.5" stroke="#0F9393" strokeWidth="1.3"/>
                  <path d="M7 4.5v3l2 1.5" stroke="#0F9393" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              }
            />
            <PageRow href={`${BASE}/extra-seo`} label="All Guides — Index" sub="Overview of all 30 mental health guides" />
          </div>

          {/* ── Bangalore Pages ── */}
          <div className="bg-white/[0.03] border border-white/8 rounded-[24px] p-6">
            <SectionHeader
              label="Therapy in Bangalore"
              count={BANG_PAGES.length}
              accent="#0F9393"
              icon={
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1C4.8 1 3 2.8 3 5c0 3.25 4 8 4 8s4-4.75 4-8c0-2.2-1.8-4-4-4z" stroke="#0F9393" strokeWidth="1.3"/>
                  <circle cx="7" cy="5" r="1.25" stroke="#0F9393" strokeWidth="1.3"/>
                </svg>
              }
            />
            {BANG_PAGES.map((p) => (
              <PageRow key={p.id} href={p.canonical} label={p.badge} sub={p.metaTitle} />
            ))}
          </div>

          {/* ── Conditions ── */}
          <div className="bg-white/[0.03] border border-white/8 rounded-[24px] p-6">
            <SectionHeader
              label="Mental Health Conditions"
              count={COND_PAGES.length}
              accent="#a78bfa"
              icon={
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2a3 3 0 013 3c0 2-1 3-2 4H6C5 9 4 8 4 5a3 3 0 013-3z" stroke="#a78bfa" strokeWidth="1.3"/>
                  <path d="M5.5 12h3" stroke="#a78bfa" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              }
            />
            {COND_PAGES.map((p) => (
              <PageRow key={p.id} href={p.canonical} label={p.badge} sub={p.metaTitle} />
            ))}
          </div>

          {/* ── Awareness ── */}
          <div className="bg-white/[0.03] border border-white/8 rounded-[24px] p-6">
            <SectionHeader
              label="Awareness & Insights"
              count={AWARE_PAGES.length}
              accent="#f59e0b"
              icon={
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="6" r="3.5" stroke="#f59e0b" strokeWidth="1.3"/>
                  <path d="M7 10.5v2" stroke="#f59e0b" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              }
            />
            {AWARE_PAGES.map((p) => (
              <PageRow key={p.id} href={p.canonical} label={p.badge} sub={p.metaTitle} />
            ))}
          </div>

          {/* ── Therapists (live) ── */}
          <div className="bg-white/[0.03] border border-white/8 rounded-[24px] p-6">
            <SectionHeader
              label="Therapist Profiles"
              count={therapists.length}
              accent="#34d399"
              icon={
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="4.5" r="2.5" stroke="#34d399" strokeWidth="1.3"/>
                  <path d="M2 12c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="#34d399" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              }
            />
            {therapists.length === 0 ? (
              <p className="font-nunito text-[13px] text-white/30 px-4 py-3">
                No therapist profiles found — check Supabase connection.
              </p>
            ) : (
              therapists.map((t) => (
                <PageRow
                  key={t.user_id}
                  href={`${BASE}/therapists/${t.user_id}`}
                  label={t.full_name}
                  sub={t.specialties?.slice(0, 2).join(' · ') ?? 'Licensed Therapist'}
                />
              ))
            )}
          </div>

          {/* ── Blog Posts (live) ── */}
          <div className="bg-white/[0.03] border border-white/8 rounded-[24px] p-6 lg:col-span-2">
            <SectionHeader
              label="Blog Posts"
              count={blogs.length}
              accent="#f59e0b"
              icon={
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1.5" y="2" width="11" height="10" rx="1.5" stroke="#f59e0b" strokeWidth="1.3"/>
                  <path d="M4 5h6M4 7.5h4" stroke="#f59e0b" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              }
            />
            {blogs.length === 0 ? (
              <p className="font-nunito text-[13px] text-white/30 px-4 py-3">
                No published blog posts found — check Supabase connection.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {blogs.map((b) => (
                  <PageRow
                    key={b.slug}
                    href={`${BASE}/blog/${b.slug}`}
                    label={b.title}
                    sub={`/blog/${b.slug} · ${new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                  />
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── XML link ── */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.03] border border-white/8 rounded-[20px] px-7 py-5">
          <div>
            <p className="font-nunito font-bold text-[15px] text-white/80">Looking for the XML sitemap?</p>
            <p className="font-nunito text-[13px] text-white/40 mt-0.5">For search engines and crawlers — auto-updated on every build.</p>
          </div>
          <a
            href="/sitemap.xml"
            target="_blank"
            className="flex-shrink-0 inline-flex items-center gap-2 font-nunito font-bold text-[13px] text-[#0F9393] border border-[#0F9393]/30 px-5 py-2.5 rounded-full hover:bg-[#0F9393]/10 transition-all"
          >
            Open sitemap.xml
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 10L10 2M4 2h6v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </section>

    </main>
  );
}
