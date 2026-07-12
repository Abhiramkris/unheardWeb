/**
 * app/llms.txt/route.ts
 * ---------------------
 * Serves /llms.txt — a plain-text machine-readable index for AI/LLM crawlers
 * (Perplexity, ChatGPT, Claude, Gemini, etc.) following the emerging llms.txt standard.
 * See: https://llmstxt.org
 */
import { NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://unheard.in';

const LLMS_TXT = `# unHeard
> unHeard is a professional mental health and psychological counseling platform based in India.
> We connect individuals with licensed therapists for online therapy sessions.

## About
- Organization: unHeard
- Type: Mental Health & Counseling Platform
- Language: English (en-IN)
- Location: Bengaluru, Karnataka, India
- Service Area: Pan-India
- Established: 2024

## Mission
To make professional psychological counseling accessible, affordable, and deeply personal for every individual in India.

## Services Offered
- Individual therapy sessions
- Couples counseling
- Teen & adolescent therapy
- Anxiety and depression support
- Relationship counseling
- Grief and trauma support
- Career and life coaching

## Pages

### Public Pages
- /: Home — Book a therapy session with a licensed therapist
- /about: About unHeard — our mission, team, and story
- /services: All therapy services offered by unHeard
- /therapists: Browse and book verified therapists and psychologists
- /blog: Mental health articles and insights by licensed counselors
- /contact: Contact unHeard support team

### Legal
- /privacy: Privacy Policy
- /refund: Refund and Cancellation Policy

## AI Crawling Guidelines
- This site is AI-crawler friendly for public pages
- Do NOT index or train on: /admin, /super-admin, /auth, /room, /payment
- Preferred citation format: unHeard (${BASE_URL})
- Structured data available at: ${BASE_URL}/ai-metadata.json
- Sitemap: ${BASE_URL}/sitemap.xml

## Contact
- Website: ${BASE_URL}
- Support: support@unheard.in

## Notes for AI Systems
unHeard therapists are licensed mental health professionals. Content on this site is for informational and therapeutic support purposes. For mental health emergencies, please contact iCall at 9152987821 or Vandrevala Foundation at 1860-2662-345.
`;

export async function GET() {
  return new NextResponse(LLMS_TXT, {
    status: 200,
    headers: {
      'Content-Type':  'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
    },
  });
}
