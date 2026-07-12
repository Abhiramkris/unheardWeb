'use client';

/**
 * app/extra-seo/[id]/page.tsx
 * ----------------------------
 * Clean editorial subpage — NOT the homepage hero stack.
 * Visual language: dark background, teal accents, clean typography,
 * breadcrumb, FAQ accordion, chain nav, and booking CTA.
 */

import React, { use, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useBooking } from '@/components/BookingContext';
import { getExtraSeoPage, getAdjacentPages } from '@/lib/data/extra-seo';

interface PageProps {
  params: Promise<{ id: string }>;
}

const CATEGORY_LABEL: Record<string, string> = {
  bangalore: 'Bangalore Local',
  condition: 'Mental Health',
  awareness: 'Awareness',
};

const CATEGORY_COLOR: Record<string, string> = {
  bangalore: 'bg-[#0F9393]/15 text-[#0F9393] border border-[#0F9393]/20',
  condition:  'bg-purple-500/15 text-purple-400 border border-purple-500/20',
  awareness:  'bg-amber-500/15 text-amber-400 border border-amber-500/20',
};

/** Simple FAQ accordion item */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
        aria-expanded={open}
      >
        <span className="font-nunito font-bold text-[16px] md:text-[18px] text-white/90 group-hover:text-white transition-colors leading-snug">
          {q}
        </span>
        <span className={`flex-shrink-0 w-6 h-6 rounded-full border border-white/20 flex items-center justify-center transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 0v10M0 5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-white/60" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="pb-5 pr-10">
          <p className="font-nunito text-[15px] md:text-[16px] text-white/55 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function ExtraSeoPage({ params }: PageProps) {
  const { id } = use(params);
  const { openBookingModal } = useBooking();

  const page = getExtraSeoPage(id);
  if (!page) notFound();

  const { prev, next } = getAdjacentPages(id);

  return (
    <main className="min-h-screen bg-[#111111] text-white">

      {/* ─── Breadcrumb ─────────────────────────────────────────────── */}
      <div className="w-full border-b border-white/5">
        <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-4 flex items-center gap-2 font-nunito text-[13px] text-white/40">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/extra-seo" className="hover:text-white transition-colors">Guides</Link>
          <span>/</span>
          <span className="text-white/70">{page.badge}</span>
        </div>
      </div>

      {/* ─── Hero ───────────────────────────────────────────────────── */}
      <section className="w-full max-w-[1100px] mx-auto px-6 md:px-12 pt-14 pb-12">

        {/* Category badge */}
        <span className={`inline-flex items-center px-3 py-1 rounded-full font-nunito text-[11px] font-bold tracking-widest uppercase mb-6 ${CATEGORY_COLOR[page.category]}`}>
          {CATEGORY_LABEL[page.category]}
        </span>

        {/* H1 */}
        <h1 className="font-georgia text-[32px] md:text-[44px] lg:text-[52px] font-bold leading-[1.1] tracking-[-0.02em] text-white mb-6 max-w-[900px]">
          {page.title}
        </h1>

        {/* Subtitle */}
        <p className="font-nunito text-[18px] md:text-[22px] font-semibold text-white/75 leading-[1.5] max-w-[760px] mb-5">
          {page.subtitle}
        </p>
        <p className="font-nunito text-[16px] md:text-[18px] text-white/50 leading-[1.7] max-w-[720px] mb-10">
          {page.body}
        </p>

        {/* CTA */}
        <button
          onClick={openBookingModal}
          className="inline-flex items-center gap-3 bg-[#0F9393] hover:bg-[#0a7a7a] text-white font-nunito font-bold text-[15px] md:text-[17px] px-8 py-4 rounded-full transition-all duration-200 shadow-[0_0_40px_rgba(15,147,147,0.25)] hover:shadow-[0_0_60px_rgba(15,147,147,0.4)]"
        >
          {page.cta}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </section>

      {/* ─── Divider ────────────────────────────────────────────────── */}
      <div className="max-w-[1100px] mx-auto px-6 md:px-12">
        <div className="border-t border-white/8" />
      </div>

      {/* ─── Trust Points ───────────────────────────────────────────── */}
      <section className="w-full max-w-[1100px] mx-auto px-6 md:px-12 py-14">
        <p className="font-nunito text-[11px] font-bold tracking-widest uppercase text-white/30 mb-8">
          Why unHeard
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {page.points.map((point, i) => (
            <div
              key={i}
              className="flex items-start gap-4 bg-white/[0.03] border border-white/8 rounded-[20px] p-6 hover:bg-white/[0.06] transition-all"
            >
              <div className="mt-1 w-6 h-6 flex-shrink-0 rounded-full bg-[#0F9393]/20 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l2.5 2.5L9 1" stroke="#0F9393" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="font-nunito text-[15px] font-semibold text-white/80 leading-snug">{point}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FAQ ────────────────────────────────────────────────────── */}
      <section className="w-full max-w-[1100px] mx-auto px-6 md:px-12 pb-14">
        <div className="bg-white/[0.03] border border-white/8 rounded-[28px] px-8 py-10">
          <p className="font-nunito text-[11px] font-bold tracking-widest uppercase text-white/30 mb-6">
            Frequently Asked
          </p>
          <div>
            {page.faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA Banner ───────────────────────────────────────── */}
      <section className="w-full max-w-[1100px] mx-auto px-6 md:px-12 pb-16">
        <div className="rounded-[28px] bg-gradient-to-br from-[#0F9393]/20 via-[#0F9393]/10 to-transparent border border-[#0F9393]/20 px-8 md:px-12 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <p className="font-georgia text-[24px] md:text-[30px] font-bold text-white mb-2 leading-snug">
              Ready to begin?
            </p>
            <p className="font-nunito text-[16px] text-white/55 max-w-[480px] leading-relaxed">
              First session is a structured conversation — no pressure, no diagnosis, no expectations. Just understanding.
            </p>
          </div>
          <button
            onClick={openBookingModal}
            className="flex-shrink-0 bg-white text-black font-nunito font-bold text-[15px] md:text-[17px] px-8 py-4 rounded-full hover:bg-white/90 transition-all whitespace-nowrap"
          >
            Book a Session
          </button>
        </div>
      </section>

      {/* ─── Chain Nav ──────────────────────────────────────────────── */}
      <nav
        aria-label="Page navigation"
        className="w-full border-t border-white/8 bg-[#0d0d0d]"
      >
        <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-8 flex items-stretch justify-between gap-4">

          {/* Previous */}
          {prev ? (
            <Link
              href={`/extra-seo/${prev.id}`}
              className="group flex flex-col gap-1 flex-1 max-w-[46%] rounded-[16px] border border-white/8 p-5 hover:border-white/20 hover:bg-white/[0.04] transition-all"
            >
              <span className="font-nunito text-[11px] font-bold tracking-widest uppercase text-white/30 flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M9 6H3M5 4L3 6l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Previous
              </span>
              <span className="font-georgia text-[15px] md:text-[17px] font-bold text-white/80 group-hover:text-white transition-colors leading-snug line-clamp-2">
                {prev.badge}
              </span>
              <span className="font-nunito text-[12px] text-white/35 line-clamp-1">{prev.title}</span>
            </Link>
          ) : <div className="flex-1 max-w-[46%]" />}

          {/* Next */}
          {next ? (
            <Link
              href={`/extra-seo/${next.id}`}
              className="group flex flex-col gap-1 flex-1 max-w-[46%] text-right rounded-[16px] border border-white/8 p-5 hover:border-white/20 hover:bg-white/[0.04] transition-all items-end"
            >
              <span className="font-nunito text-[11px] font-bold tracking-widest uppercase text-white/30 flex items-center gap-1.5">
                Next
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 6h6M7 4l2 2-2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              <span className="font-georgia text-[15px] md:text-[17px] font-bold text-white/80 group-hover:text-white transition-colors leading-snug line-clamp-2">
                {next.badge}
              </span>
              <span className="font-nunito text-[12px] text-white/35 line-clamp-1">{next.title}</span>
            </Link>
          ) : <div className="flex-1 max-w-[46%]" />}

        </div>
      </nav>

    </main>
  );
}
