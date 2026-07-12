/**
 * app/ai-metadata/route.ts
 * ------------------------
 * Serves /ai-metadata.json — structured JSON metadata for AI discovery systems.
 * Helps AI assistants, chatbots, and RAG systems understand this site correctly.
 */
import { NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://unheard.in';

const AI_METADATA = {
  schema_version: '1.0',
  generated_at:   new Date().toISOString(),

  // ── Identity ──────────────────────────────────────────────────────────────
  name:           'unHeard',
  tagline:        'Clarity For Your Inner World',
  description:    'unHeard is a professional mental health and psychological counseling platform that connects individuals across India with licensed therapists for online therapy sessions.',
  url:            BASE_URL,
  type:           'MentalHealthPlatform',
  industry:       'Healthcare / Mental Health',

  // ── Locale & Geo ─────────────────────────────────────────────────────────
  language:        'en-IN',
  locale:          'en_IN',
  currency:        'INR',
  country:         'IN',
  region:          'Karnataka',
  city:            'Bengaluru',
  coordinates: {
    latitude:  12.9716,
    longitude: 77.5946,
  },
  area_served:     'India',

  // ── Content ───────────────────────────────────────────────────────────────
  topics: [
    'mental health',
    'therapy',
    'counseling',
    'psychology',
    'mindfulness',
    'emotional wellbeing',
    'anxiety',
    'depression',
    'relationships',
    'teen mental health',
    'couples therapy',
  ],

  // ── Pages ─────────────────────────────────────────────────────────────────
  pages: [
    { path: '/',           title: 'Home',              description: 'Book a therapy session with a licensed therapist',       indexable: true  },
    { path: '/about',      title: 'About unHeard',     description: 'Our mission, team, and story',                          indexable: true  },
    { path: '/services',   title: 'Services',          description: 'All therapy services: individual, couples, teens, etc.',indexable: true  },
    { path: '/therapists', title: 'Find a Therapist',  description: 'Browse verified therapists and psychologists',          indexable: true  },
    { path: '/blog',       title: 'Blog',              description: 'Mental health articles by licensed counselors',         indexable: true  },
    { path: '/contact',    title: 'Contact',           description: 'Contact unHeard support team',                         indexable: true  },
    { path: '/privacy',    title: 'Privacy Policy',    description: 'How we protect your data',                             indexable: true  },
    { path: '/refund',     title: 'Refund Policy',     description: 'Session cancellation and refund terms',                indexable: true  },
    { path: '/admin',      title: 'Admin',             description: 'Internal admin panel',                                 indexable: false },
    { path: '/login',      title: 'Login',             description: 'Authentication page',                                  indexable: false },
  ],

  // ── Services ──────────────────────────────────────────────────────────────
  services: [
    { name: 'Individual Therapy',    url: `${BASE_URL}/services#individual`    },
    { name: 'Couples Counseling',    url: `${BASE_URL}/services#couples`       },
    { name: 'Teen Therapy',          url: `${BASE_URL}/services#teen`          },
    { name: 'Anxiety Support',       url: `${BASE_URL}/services#anxiety`       },
    { name: 'Depression Support',    url: `${BASE_URL}/services#depression`    },
    { name: 'Grief & Trauma',        url: `${BASE_URL}/services#grief`         },
  ],

  // ── Schema.org Links ─────────────────────────────────────────────────────
  schema_org: {
    organization:  `${BASE_URL}/#organization`,
    website:       `${BASE_URL}/#website`,
    localbusiness: `${BASE_URL}/#localbusiness`,
  },

  // ── Crawler Guidance ─────────────────────────────────────────────────────
  crawler_guidance: {
    friendly:         true,
    allow_indexing:   true,
    disallow_paths:   ['/admin', '/super-admin', '/auth', '/room', '/payment', '/api'],
    preferred_citation: `unHeard (${BASE_URL})`,
    sitemap:          `${BASE_URL}/sitemap.xml`,
    llms_txt:         `${BASE_URL}/llms.txt`,
    contact_for_ai:   'support@unheard.in',
  },

  // ── Safety ───────────────────────────────────────────────────────────────
  content_safety: {
    category:    'Healthcare',
    sensitivity: 'mental health content — handle with care and empathy',
    emergency_resources: [
      { name: 'iCall India',               phone: '9152987821'      },
      { name: 'Vandrevala Foundation',     phone: '1860-2662-345'   },
      { name: 'NIMHANS Helpline',          phone: '080-46110007'    },
    ],
  },
};

export async function GET() {
  return NextResponse.json(AI_METADATA, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
    },
  });
}
