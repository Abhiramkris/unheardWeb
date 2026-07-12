'use client';

/**
 * app/extra-seo/[id]/not-found.tsx
 * Shown when an unknown id is requested (e.g. /extra-seo/xyz).
 */
import Link from 'next/link';

export default function ExtraSeoNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 bg-[#111111]">
      <p className="font-nunito text-[14px] font-bold tracking-widest uppercase text-[#0F9393] mb-4">
        Page Not Found
      </p>
      <h1 className="font-georgia text-[40px] md:text-[56px] font-bold text-white leading-tight mb-6">
        This page doesn&apos;t exist.
      </h1>
      <p className="font-nunito text-[18px] text-white/50 max-w-[480px] mb-10">
        The SEO page you&apos;re looking for hasn&apos;t been created yet.
      </p>
      <Link
        href="/"
        className="bg-white text-black font-nunito font-bold text-[15px] px-8 py-4 rounded-full hover:bg-white/90 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
