/**
 * app/layout.tsx — Root Layout
 * Injects global Organization, WebSite, and LocalBusiness JSON-LD.
 * Per-page metadata is handled by each route's own layout or generateMetadata().
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { BookingProvider } from "@/components/BookingContext";
import { Footer } from "@/components/Footer";
import { NotificationProvider } from "@/components/NotificationContext";
import { PushInitializer } from "@/components/PushInitializer";
import { PhonePeProvider } from "@/components/PhonePeProvider";
import { JsonLd } from "@/components/seo/JsonLd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://unheard.in";

export const metadata: Metadata = {
  title: {
    default:  "unHeard — Clarity For Your Inner World",
    template: "%s | unHeard",
  },
  description:
    "Professional psychological counseling that listens, understands context, and responds with clarity. Begin with understanding at unHeard.",
  metadataBase: new URL(BASE_URL),
  manifest: "/manifest.json",
  icons: {
    icon:  "/assets/logo unherd white.svg",
    apple: "/assets/logo unherd white.svg",
  },
  appleWebApp: {
    capable:         true,
    statusBarStyle:  "black-translucent",
    title:           "unHeard",
  },
  openGraph: {
    siteName: "unHeard",
    locale:   "en_IN",
    type:     "website",
    images: [
      {
        url:    `${BASE_URL}/og/default.png`,
        width:  1200,
        height: 630,
        alt:    "unHeard — Clarity For Your Inner World",
      },
    ],
  },
  twitter: {
    card:    "summary_large_image",
    site:    "@unheard_in",
    creator: "@unheard_in",
  },
  // Global geo meta tags (Bengaluru, Karnataka, India)
  other: {
    "geo.region":    "IN-KA",
    "geo.placename": "Bengaluru, Karnataka, India",
    "geo.position":  "12.9716;77.5946",
    "ICBM":          "12.9716, 77.5946",
  },
};

// Global JSON-LD schemas applied to every page
const GLOBAL_SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type":    "Organization",
    "@id":      `${BASE_URL}/#organization`,
    name:       "unHeard",
    url:        BASE_URL,
    logo: {
      "@type": "ImageObject",
      url:     `${BASE_URL}/assets/logo unherd white.svg`,
      width:   200,
      height:  60,
    },
    contactPoint: {
      "@type":           "ContactPoint",
      contactType:       "customer support",
      availableLanguage: ["English", "Hindi"],
    },
  },
  {
    "@context": "https://schema.org",
    "@type":    "WebSite",
    "@id":      `${BASE_URL}/#website`,
    name:       "unHeard",
    url:        BASE_URL,
    potentialAction: {
      "@type":       "SearchAction",
      target:        `${BASE_URL}/therapists?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLd data={GLOBAL_SCHEMAS} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} antialiased min-h-screen bg-[#111111] text-white overflow-x-clip`}
      >
        <BookingProvider>
          <NotificationProvider>
            <PhonePeProvider />
            <PushInitializer />
            <Navbar />
            {children}
            <Footer />
          </NotificationProvider>
        </BookingProvider>
      </body>
    </html>
  );
}
