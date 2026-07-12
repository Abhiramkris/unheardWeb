#!/usr/bin/env node
/**
 * generate-seo.js
 * ---------------
 * Pre-build script that creates/updates the `seo/` directory at the project root.
 * Each JSON file describes the full SEO payload for one route.
 *
 * Rules:
 *  - Runs via the `prebuild` npm hook (automatically before `next build`)
 *  - NON-DESTRUCTIVE: existing files are NOT overwritten (manual edits are preserved)
 *  - New routes added here will scaffold their JSON on the next build
 */

const fs   = require('fs');
const path = require('path');

const ROOT    = path.resolve(__dirname, '..');
const SEO_DIR = path.join(ROOT, 'seo');

const BASE_URL    = 'https://unheard.in';
const SITE_NAME   = 'unHeard';
const OG_DEFAULT  = `${BASE_URL}/og/default.png`;

// Shared geo payload (Bengaluru, Karnataka, India)
const GEO = {
  region:    'IN-KA',
  placename: 'Bengaluru, Karnataka, India',
  position:  '12.9716;77.5946',
  icbm:      '12.9716, 77.5946',
};

// Shared org schema fragment
const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type':    'Organization',
  '@id':      `${BASE_URL}/#organization`,
  name:       SITE_NAME,
  url:        BASE_URL,
  logo: {
    '@type':        'ImageObject',
    url:            `${BASE_URL}/assets/logo unherd white.svg`,
    width:          200,
    height:         60,
  },
  sameAs: [],
  contactPoint: {
    '@type':             'ContactPoint',
    contactType:         'customer support',
    availableLanguage:   ['English', 'Hindi'],
  },
};

const LOCAL_BUSINESS = {
  '@context':       'https://schema.org',
  '@type':          ['MedicalBusiness', 'LocalBusiness'],
  '@id':            `${BASE_URL}/#localbusiness`,
  name:             SITE_NAME,
  description:      'Professional psychological counseling platform offering therapy sessions online.',
  url:              BASE_URL,
  telephone:        '',
  address: {
    '@type':           'PostalAddress',
    addressLocality:   'Bengaluru',
    addressRegion:     'Karnataka',
    addressCountry:    'IN',
  },
  geo: {
    '@type':    'GeoCoordinates',
    latitude:   12.9716,
    longitude:  77.5946,
  },
  areaServed:        'India',
  priceRange:        '₹₹',
  currenciesAccepted:'INR',
  openingHours:      'Mo-Su 08:00-22:00',
};

const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type':    'WebSite',
  '@id':      `${BASE_URL}/#website`,
  name:       SITE_NAME,
  url:        BASE_URL,
  potentialAction: {
    '@type':       'SearchAction',
    target:        `${BASE_URL}/therapists?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

// ─── Route definitions ───────────────────────────────────────────────────────

const ROUTES = [
  {
    file: 'home.json',
    data: {
      title:       `${SITE_NAME} — Clarity For Your Inner World`,
      description: 'Professional psychological counseling that listens, understands, and responds with clarity. Book a session with a licensed therapist today.',
      keywords:    ['online therapy India', 'mental health counseling', 'therapist online', 'psychology counseling', 'unHeard therapy', 'online counseling Bengaluru'],
      ogImage:     `${BASE_URL}/og/home.png`,
      canonical:   BASE_URL,
      noindex:     false,
      geo:         GEO,
      schema: [ORG_SCHEMA, WEBSITE_SCHEMA, LOCAL_BUSINESS],
    },
  },
  {
    file: 'about.json',
    data: {
      title:       `About unHeard | Our Mission & Story`,
      description: 'Learn about unHeard — a mental health platform built to make professional counseling accessible, affordable, and deeply personal across India.',
      keywords:    ['about unHeard', 'mental health platform India', 'online therapy mission', 'counseling platform story'],
      ogImage:     `${BASE_URL}/og/about.png`,
      canonical:   `${BASE_URL}/about`,
      noindex:     false,
      geo:         GEO,
      schema: [
        ORG_SCHEMA,
        {
          '@context': 'https://schema.org',
          '@type':    'AboutPage',
          '@id':      `${BASE_URL}/about#webpage`,
          name:       'About unHeard',
          url:        `${BASE_URL}/about`,
          isPartOf:   { '@id': `${BASE_URL}/#website` },
          about:      { '@id': `${BASE_URL}/#organization` },
        },
      ],
    },
  },
  {
    file: 'services.json',
    data: {
      title:       `Therapy Services | Individual, Couples & Teen Counseling`,
      description: 'Explore unHeard therapy services: individual counseling, couples therapy, teen therapy, and more. Tailored mental health support by licensed professionals.',
      keywords:    ['individual therapy India', 'couples counseling online', 'teen therapy', 'mental health services', 'therapy types India'],
      ogImage:     `${BASE_URL}/og/services.png`,
      canonical:   `${BASE_URL}/services`,
      noindex:     false,
      geo:         GEO,
      schema: [
        {
          '@context': 'https://schema.org',
          '@type':    'Service',
          '@id':      `${BASE_URL}/services#service`,
          name:       'Mental Health Counseling Services',
          provider:   { '@id': `${BASE_URL}/#organization` },
          serviceType:'Psychological Counseling',
          areaServed: 'India',
          url:        `${BASE_URL}/services`,
        },
        {
          '@context':    'https://schema.org',
          '@type':       'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home',     item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: 'Services', item: `${BASE_URL}/services` },
          ],
        },
      ],
    },
  },
  {
    file: 'therapists.json',
    data: {
      title:       `Find a Therapist | Licensed Counselors & Psychologists`,
      description: 'Browse verified therapists and psychologists on unHeard. Filter by specialty, language, and availability. Book your first session online today.',
      keywords:    ['find therapist India', 'licensed psychologist online', 'book therapist', 'counselor online India', 'therapist list'],
      ogImage:     `${BASE_URL}/og/therapists.png`,
      canonical:   `${BASE_URL}/therapists`,
      noindex:     false,
      geo:         GEO,
      schema: [
        {
          '@context': 'https://schema.org',
          '@type':    'CollectionPage',
          name:       'Our Therapists',
          url:        `${BASE_URL}/therapists`,
          isPartOf:   { '@id': `${BASE_URL}/#website` },
        },
        {
          '@context':    'https://schema.org',
          '@type':       'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home',       item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: 'Therapists', item: `${BASE_URL}/therapists` },
          ],
        },
      ],
    },
  },
  {
    file: 'contact.json',
    data: {
      title:       `Contact unHeard | Get in Touch`,
      description: 'Have questions? Reach out to unHeard. We are here to help you find the right therapist and guide you through your mental health journey.',
      keywords:    ['contact unHeard', 'mental health support contact', 'therapy helpline India'],
      ogImage:     `${BASE_URL}/og/contact.png`,
      canonical:   `${BASE_URL}/contact`,
      noindex:     false,
      geo:         GEO,
      schema: [
        {
          '@context': 'https://schema.org',
          '@type':    'ContactPage',
          name:       'Contact unHeard',
          url:        `${BASE_URL}/contact`,
          isPartOf:   { '@id': `${BASE_URL}/#website` },
        },
        LOCAL_BUSINESS,
        {
          '@context':    'https://schema.org',
          '@type':       'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home',    item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: 'Contact', item: `${BASE_URL}/contact` },
          ],
        },
      ],
    },
  },
  {
    file: 'blog.json',
    data: {
      title:       `Mental Health Blog | Articles & Insights by unHeard`,
      description: 'Read expert articles on mental health, therapy, mindfulness, and emotional wellbeing. Insights from licensed counselors at unHeard.',
      keywords:    ['mental health blog', 'therapy articles India', 'psychology insights', 'mindfulness tips', 'emotional wellbeing'],
      ogImage:     `${BASE_URL}/og/blog.png`,
      canonical:   `${BASE_URL}/blog`,
      noindex:     false,
      geo:         GEO,
      schema: [
        {
          '@context': 'https://schema.org',
          '@type':    'Blog',
          '@id':      `${BASE_URL}/blog#blog`,
          name:       'unHeard Mental Health Blog',
          url:        `${BASE_URL}/blog`,
          publisher:  { '@id': `${BASE_URL}/#organization` },
        },
        {
          '@context':    'https://schema.org',
          '@type':       'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog` },
          ],
        },
      ],
    },
  },
  {
    file: 'privacy.json',
    data: {
      title:       `Privacy Policy | unHeard`,
      description: 'Read the unHeard privacy policy. We are committed to protecting your personal data and mental health information with the highest standards.',
      keywords:    ['unHeard privacy policy', 'mental health data privacy', 'therapy platform privacy'],
      ogImage:     OG_DEFAULT,
      canonical:   `${BASE_URL}/privacy`,
      noindex:     false,
      geo:         GEO,
      schema: [
        {
          '@context': 'https://schema.org',
          '@type':    'WebPage',
          name:       'Privacy Policy',
          url:        `${BASE_URL}/privacy`,
          isPartOf:   { '@id': `${BASE_URL}/#website` },
        },
      ],
    },
  },
  {
    file: 'refund.json',
    data: {
      title:       `Refund Policy | unHeard`,
      description: 'Learn about unHeard refund and cancellation policy for therapy sessions. We strive to be fair and transparent.',
      keywords:    ['unHeard refund policy', 'therapy session refund', 'cancellation policy'],
      ogImage:     OG_DEFAULT,
      canonical:   `${BASE_URL}/refund`,
      noindex:     false,
      geo:         GEO,
      schema: [
        {
          '@context': 'https://schema.org',
          '@type':    'WebPage',
          name:       'Refund Policy',
          url:        `${BASE_URL}/refund`,
          isPartOf:   { '@id': `${BASE_URL}/#website` },
        },
      ],
    },
  },
];

// ─── Runner ──────────────────────────────────────────────────────────────────

function run() {
  // 1. Ensure seo/ directory exists
  if (!fs.existsSync(SEO_DIR)) {
    fs.mkdirSync(SEO_DIR, { recursive: true });
    console.log(`✅  Created directory: seo/`);
  } else {
    console.log(`📁  Directory exists: seo/`);
  }

  let created = 0;
  let skipped = 0;

  for (const route of ROUTES) {
    const filePath = path.join(SEO_DIR, route.file);

    if (fs.existsSync(filePath)) {
      console.log(`⏭   Skipped (exists): seo/${route.file}`);
      skipped++;
    } else {
      fs.writeFileSync(filePath, JSON.stringify(route.data, null, 2) + '\n', 'utf8');
      console.log(`✍️   Created: seo/${route.file}`);
      created++;
    }
  }

  console.log(`\n🚀  SEO scaffold done — ${created} created, ${skipped} skipped.\n`);
}

run();
