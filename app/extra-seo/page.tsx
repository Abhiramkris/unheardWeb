/**
 * app/extra-seo/page.tsx  — INDEX PAGE
 * Serves /extra-seo  — the hub that lists all 30 SEO subpages
 * in grouped categories with a clean card grid.
 * This is a SERVER component (no 'use client') so it can export metadata.
 */
import { Metadata } from 'next';
import Link from 'next/link';
import { EXTRA_SEO_PAGES, ExtraSeoPage } from '@/lib/data/extra-seo';

export const metadata: Metadata = {
  title: 'Mental Health Guides & Local Therapy in Bangalore | unHeard',
  description: 'Explore unHeard\'s guides on therapy in Bangalore neighbourhoods, mental health conditions, and mental health awareness. Find professional support near you.',
  alternates: { canonical: 'https://unheard.in/extra-seo' },
  robots: { index: true, follow: true },
};

const BASE_URL = 'https://unheard.in';

const CATEGORIES = [
  {
    key: 'bangalore' as const,
    label: 'Therapy in Bangalore',
    subtitle: 'Online therapy for every corner of Bangalore.',
    color: 'from-[#0F9393]/20 to-transparent',
    badge: 'bg-[#0F9393]/15 text-[#0F9393] border-[#0F9393]/20',
    dot: 'bg-[#0F9393]',
  },
  {
    key: 'condition' as const,
    label: 'Mental Health Conditions',
    subtitle: 'Evidence-based therapy for specific concerns.',
    color: 'from-purple-500/20 to-transparent',
    badge: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    dot: 'bg-purple-400',
  },
  {
    key: 'awareness' as const,
    label: 'Mental Health Awareness',
    subtitle: 'Honest conversations about therapy, AI, self-care, and stigma.',
    color: 'from-amber-500/20 to-transparent',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
  },
];

function PageCard({ page, dotColor, badgeCls }: { page: ExtraSeoPage; dotColor: string; badgeCls: string }) {
  return (
    <Link
      href={`/extra-seo/${page.id}`}
      className="group flex flex-col gap-3 bg-white/[0.03] border border-white/8 rounded-[20px] p-6 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-200"
    >
      <span className={`inline-flex items-center gap-1.5 font-nunito text-[11px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border ${badgeCls} w-fit`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        {page.badge}
      </span>
      <h3 className="font-georgia text-[17px] font-bold text-white/85 group-hover:text-white transition-colors leading-snug line-clamp-2">
        {page.title}
      </h3>
      <p className="font-nunito text-[13px] text-white/45 leading-relaxed line-clamp-2">{page.subtitle}</p>
      <div className="flex items-center gap-1.5 text-[#0F9393] font-nunito text-[13px] font-bold mt-auto pt-2">
        Read more
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="group-hover:translate-x-1 transition-transform">
          <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  );
}

export default function ExtraSeoIndex() {
  const pagesByCategory = (cat: ExtraSeoPage['category']) =>
    EXTRA_SEO_PAGES.filter((p) => p.category === cat);

  return (
    <main className="min-h-screen bg-[#111111] text-white">

      {/* ─── Header ─── */}
      <section className="w-full max-w-[1100px] mx-auto px-6 md:px-12 pt-16 pb-12">
        <nav className="flex items-center gap-2 font-nunito text-[13px] text-white/40 mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-white/70">Guides</span>
        </nav>

        <p className="font-nunito text-[11px] font-bold tracking-widest uppercase text-[#0F9393] mb-4">
          unHeard Guides
        </p>
        <h1 className="font-georgia text-[36px] md:text-[52px] font-bold leading-[1.1] text-white mb-5 max-w-[800px]">
          Mental Health Support. <br className="hidden md:block" />
          Wherever You Are in Bangalore.
        </h1>
        <p className="font-nunito text-[17px] md:text-[20px] text-white/55 max-w-[640px] leading-relaxed mb-10">
          30 guides covering therapy across Bangalore&apos;s neighbourhoods, specific mental health conditions, and honest conversations about therapy, AI, and self-care.
        </p>

        {/* Chain link — first page */}
        <Link
          href={`/extra-seo/${EXTRA_SEO_PAGES[0].id}`}
          className="inline-flex items-center gap-3 bg-[#0F9393] hover:bg-[#0a7a7a] text-white font-nunito font-bold text-[15px] px-7 py-3.5 rounded-full transition-all shadow-[0_0_40px_rgba(15,147,147,0.2)]"
        >
          Start Reading
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </section>

      {/* ─── Structured data for the index ─── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type':    'CollectionPage',
            name:       'Mental Health Guides | unHeard',
            url:        `${BASE_URL}/extra-seo`,
            isPartOf:   { '@id': `${BASE_URL}/#website` },
            hasPart:    EXTRA_SEO_PAGES.map((p) => ({
              '@type': 'WebPage',
              name:    p.metaTitle,
              url:     p.canonical,
              description: p.metaDesc,
            })),
          }),
        }}
      />

      {/* ─── Category Sections ─── */}
      {CATEGORIES.map((cat) => {
        const pages = pagesByCategory(cat.key);
        return (
          <section key={cat.key} className="w-full max-w-[1100px] mx-auto px-6 md:px-12 pb-16">
            {/* Section header */}
            <div className={`w-full rounded-[20px] bg-gradient-to-r ${cat.color} border border-white/8 px-8 py-7 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
              <div>
                <h2 className="font-georgia text-[22px] md:text-[26px] font-bold text-white mb-1">{cat.label}</h2>
                <p className="font-nunito text-[14px] text-white/50">{cat.subtitle}</p>
              </div>
              <span className="font-nunito text-[12px] font-bold text-white/30 bg-white/5 px-3 py-1 rounded-full border border-white/8 whitespace-nowrap">
                {pages.length} pages
              </span>
            </div>

            {/* Card grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pages.map((page) => (
                <PageCard key={page.id} page={page} dotColor={cat.dot} badgeCls={cat.badge} />
              ))}
            </div>
          </section>
        );
      })}

      {/* ─── Bottom CTA ─── */}
      <section className="w-full max-w-[1100px] mx-auto px-6 md:px-12 pb-20">
        <div className="rounded-[28px] bg-gradient-to-br from-[#0F9393]/20 via-[#0F9393]/10 to-transparent border border-[#0F9393]/20 px-8 md:px-14 py-14 text-center">
          <p className="font-georgia text-[28px] md:text-[36px] font-bold text-white mb-3">
            Ready to start therapy in Bangalore?
          </p>
          <p className="font-nunito text-[16px] text-white/50 mb-8 max-w-[480px] mx-auto leading-relaxed">
            Online. Private. Licensed therapists who understand your context.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-3 bg-white text-black font-nunito font-bold text-[16px] px-9 py-4 rounded-full hover:bg-white/90 transition-all"
          >
            Book a Session
          </Link>
        </div>
      </section>

    </main>
  );
}
