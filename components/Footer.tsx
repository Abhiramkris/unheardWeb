'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { EXTRA_SEO_PAGES } from '@/lib/data/extra-seo';

export function Footer() {
  const pathname = usePathname();
  const isExcludedPage =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/super-admin') ||
    pathname === '/login';

  if (isExcludedPage) return null;

  return (
    <footer className="bg-black text-white py-12 px-6 md:px-12 w-full relative z-40 border-t border-[#333]">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">

        {/* Brand */}
        <div className="flex flex-col">
          <Link href="/">
            <Image
              src="/assets/logo unherd white.svg"
              alt="unHeard Logo"
              width={140}
              height={35}
              className="h-[35px] w-auto mb-4 hover:opacity-80 transition-opacity"
            />
          </Link>
          <p className="text-gray-400 font-nunito max-w-[400px]">
            Providing confidential, evidence-based online therapy to help you discover, reflect, and grow.
          </p>
        </div>

        {/* Nav columns */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 font-nunito text-[16px]">
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-white mb-2">Company</h4>
            <Link href="/about"      className="text-gray-400 hover:text-white transition-colors">About Us</Link>
            <Link href="/contact"    className="text-gray-400 hover:text-white transition-colors">Contact</Link>
            <Link href="/therapists" className="text-gray-400 hover:text-white transition-colors">Our Therapists</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-white mb-2">Legal</h4>
            <Link href="/privacy"       className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/refund"        className="text-gray-400 hover:text-white transition-colors">Refund Policy</Link>
            <Link href="/terms"         className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/sitemap-page"  className="text-gray-400 hover:text-white transition-colors">Sitemap</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-white mb-2">Guides</h4>
            <Link href="/extra-seo/therapist-koramangala-bangalore" className="text-gray-400 hover:text-white transition-colors text-[14px]">Therapists in Koramangala</Link>
            <Link href="/extra-seo/therapist-indiranagar-bangalore" className="text-gray-400 hover:text-white transition-colors text-[14px]">Therapists in Indiranagar</Link>
            <Link href="/extra-seo/anxiety-therapy-bangalore" className="text-gray-400 hover:text-white transition-colors text-[14px]">Anxiety Therapy</Link>
            <Link href="/extra-seo/depression-therapy-bangalore" className="text-gray-400 hover:text-white transition-colors text-[14px]">Depression Therapy</Link>
            <Link href="/extra-seo" className="text-[#0F9393] hover:text-white transition-colors font-bold text-[14px]">All Guides →</Link>
          </div>
        </div>
      </div>

      {/* Invisible SEO crawl links — not shown to users, crawlable by Google */}
      <div className="sr-only" aria-hidden="true">
        {EXTRA_SEO_PAGES.map((p) => (
          <Link key={p.id} href={`/extra-seo/${p.id}`}>{p.metaTitle}</Link>
        ))}
        <Link href="/extra-seo">Mental Health Guides</Link>
        <Link href="/sitemap-page">Sitemap</Link>
      </div>

      <div className="mt-16 text-center text-gray-600 text-[14px] border-t border-[#333] pt-6 w-full max-w-[1400px] mx-auto">
        © {new Date().getFullYear()} Unheard. All rights reserved.
      </div>
    </footer>
  );
}
