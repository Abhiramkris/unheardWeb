/**
 * lib/data/extra-seo.ts  (REPLACED)
 * -----------------------------------
 * Source of truth for all /extra-seo/[id] pages.
 *
 * 30 pages covering:
 *  – Bangalore local hubs (Koramangala, Indiranagar, Whitefield, etc.)
 *  – Mental health topics (anxiety, depression, burnout, OCD, trauma…)
 *  – Cultural / awareness pages ("ChatGPT is not a therapist", self-care, etc.)
 *
 * ADDING A NEW PAGE:  append an entry to EXTRA_SEO_PAGES. That's it.
 * The layout auto-generates metadata + JSON-LD, the sitemap auto-includes it,
 * and the footer + chain nav update automatically.
 */

export interface ExtraSeoPage {
  id:          string;     // URL slug  →  /extra-seo/<id>
  badge:       string;     // Short label shown in breadcrumb / badge
  category:   'bangalore' | 'condition' | 'awareness';
  title:       string;     // <h1>
  subtitle:    string;     // Lead paragraph (bold)
  body:        string;     // Supporting paragraph
  cta:         string;     // CTA button text
  metaTitle:   string;
  metaDesc:    string;
  keywords:    string[];
  canonical:   string;
  /** 3-4 FAQ items rendered on the page */
  faqs:        { q: string; a: string }[];
  /** 3 trust / bullet points */
  points:      string[];
}

const BASE = 'https://unheard.in';

export const EXTRA_SEO_PAGES: ExtraSeoPage[] = [

  /* ═══════════════════════════════════════════════════════
     BANGALORE LOCAL HUBS  (1–15)
  ═══════════════════════════════════════════════════════ */

  {
    id: 'therapist-koramangala-bangalore',
    badge: 'Koramangala',
    category: 'bangalore',
    title: 'Therapy in Koramangala — For the Minds Behind the Hustle.',
    subtitle: 'Koramangala runs on ambition. But high performance and mental health are not opposites — they need each other.',
    body: 'Whether you\'re a founder managing 80-hour weeks, a professional navigating startup culture, or simply someone who can\'t switch off at night — unHeard therapists understand the Koramangala reality. Licensed, online, private.',
    cta: 'Book a Session',
    metaTitle: 'Online Therapist in Koramangala Bangalore | unHeard',
    metaDesc: 'Find a licensed online therapist in Koramangala, Bangalore. Professional counseling for work stress, anxiety, burnout, and more. Book at unHeard.',
    keywords: ['therapist Koramangala', 'online therapy Koramangala Bangalore', 'counseling Koramangala', 'psychologist Koramangala'],
    canonical: `${BASE}/extra-seo/therapist-koramangala-bangalore`,
    faqs: [
      { q: 'Do you offer sessions for people in Koramangala?', a: 'Yes — all our sessions are online. You can attend from your home or office in Koramangala without any travel.' },
      { q: 'Are the therapists familiar with startup / work culture?', a: 'Our therapists understand high-performance environments, founder pressure, and work-related stress patterns common in Bangalore\'s tech and startup ecosystem.' },
      { q: 'How soon can I get an appointment?', a: 'Most clients get their first session within 48–72 hours of booking.' },
    ],
    points: ['Licensed therapists, no scripts', 'Online — attend from Koramangala or anywhere', 'Confidential, private sessions'],
  },

  {
    id: 'therapist-indiranagar-bangalore',
    badge: 'Indiranagar',
    category: 'bangalore',
    title: 'Indiranagar Never Sleeps. Your Mind Deserves To.',
    subtitle: 'Between the café culture, the social pressure, and the career grind — Indiranagar is one of Bangalore\'s most energy-intense neighbourhoods.',
    body: 'Our therapists help you understand what\'s underneath the surface — not just the stress, but the patterns, beliefs, and emotional habits that make it hard to actually rest.',
    cta: 'Start Therapy',
    metaTitle: 'Online Therapist in Indiranagar Bangalore | unHeard',
    metaDesc: 'Licensed online therapy in Indiranagar, Bangalore. Professional counseling for stress, anxiety, relationships, and mental clarity. Book at unHeard.',
    keywords: ['therapist Indiranagar', 'online therapy Indiranagar Bangalore', 'psychologist Indiranagar', 'counseling Indiranagar'],
    canonical: `${BASE}/extra-seo/therapist-indiranagar-bangalore`,
    faqs: [
      { q: 'Can I do therapy from Indiranagar?', a: 'Yes — sessions are fully online. You can join from anywhere in Bangalore, including your Indiranagar flat or office.' },
      { q: 'What issues do Indiranagar clients typically come with?', a: 'Social anxiety, relationship stress, career pressure, burnout, and the feeling of being permanently "on" are common themes we work with.' },
      { q: 'Is this confidential?', a: 'Completely. No records are shared. Your sessions are private between you and your therapist.' },
    ],
    points: ['Understand patterns, not just symptoms', 'Flexible scheduling around Bangalore hours', 'No judgment, no scripts'],
  },

  {
    id: 'therapist-whitefield-bangalore',
    badge: 'Whitefield',
    category: 'bangalore',
    title: 'Whitefield Works Hard. Your Mental Health Should Work Too.',
    subtitle: 'IT corridors, long commutes, and the pressure of perpetual performance — Whitefield has a pace that\'s hard to step back from.',
    body: 'unHeard therapists work with tech professionals, team leads, and anyone navigating the weight of always having to deliver. Online sessions, no commute required.',
    cta: 'Book a Session',
    metaTitle: 'Online Therapist in Whitefield Bangalore | unHeard',
    metaDesc: 'Online therapy in Whitefield, Bangalore for IT professionals and anyone managing work stress, anxiety, or burnout. Licensed therapists. Book at unHeard.',
    keywords: ['therapist Whitefield', 'online therapy Whitefield Bangalore', 'counselor Whitefield', 'IT professional therapy Bangalore'],
    canonical: `${BASE}/extra-seo/therapist-whitefield-bangalore`,
    faqs: [
      { q: 'Do you understand the IT work culture?', a: 'Yes. Our therapists work with many tech professionals dealing with performance pressure, layoff anxiety, team conflict, and career uncertainty.' },
      { q: 'Can I attend sessions during lunch breaks?', a: 'Absolutely. We offer flexible timing including midday and evening slots to fit around demanding schedules.' },
      { q: 'What is the format of a session?', a: 'Sessions are 50–60 minutes, one-on-one, fully online via video call. Completely private.' },
    ],
    points: ['Built for high-pressure work lives', '50-60 min structured sessions', 'Private and secure online platform'],
  },

  {
    id: 'therapist-hsr-layout-bangalore',
    badge: 'HSR Layout',
    category: 'bangalore',
    title: 'HSR Layout: Where Growth Happens. Including the Inner Kind.',
    subtitle: 'Startups, co-working spaces, young professionals — HSR Layout has become one of Bangalore\'s most driven neighbourhoods.',
    body: 'High ambition often comes with high internal pressure. Our therapists help you work through anxiety, self-doubt, relationship strain, and the mental cost of building something from scratch.',
    cta: 'Start Now',
    metaTitle: 'Online Therapist in HSR Layout Bangalore | unHeard',
    metaDesc: 'Licensed online therapy in HSR Layout, Bangalore. For startup founders, professionals, and anyone managing stress and mental wellbeing. Book at unHeard.',
    keywords: ['therapist HSR Layout', 'online therapy HSR Layout Bangalore', 'counselor HSR Layout', 'psychologist HSR Bangalore'],
    canonical: `${BASE}/extra-seo/therapist-hsr-layout-bangalore`,
    faqs: [
      { q: 'I\'m a founder. Is therapy relevant for me?', a: 'Very much so. Founders often carry enormous pressure — loneliness, imposter syndrome, team conflict, and fear of failure. These are patterns therapy is designed to work through.' },
      { q: 'How quickly can sessions be scheduled?', a: 'Within 48 hours for most clients. We know your time is limited.' },
      { q: 'Is this confidential?', a: 'Yes. Everything shared in sessions stays between you and your therapist.' },
    ],
    points: ['Therapists who understand startup culture', 'Fast scheduling, flexible timing', 'Evidence-based, not motivational'],
  },

  {
    id: 'therapist-electronic-city-bangalore',
    badge: 'Electronic City',
    category: 'bangalore',
    title: 'Electronic City Builds Technology. Who\'s Building Your Mental Resilience?',
    subtitle: 'Long hours, long commutes, and the weight of delivery pressure — Electronic City professionals carry a lot.',
    body: 'Our therapists understand the IT professional\'s reality — performance reviews, team dynamics, work-life imbalance, and the anxiety that doesn\'t clock out when you do.',
    cta: 'Book a Session',
    metaTitle: 'Online Therapist in Electronic City Bangalore | unHeard',
    metaDesc: 'Online therapy for IT professionals in Electronic City, Bangalore. Licensed counselors for work stress, anxiety, and burnout. Book at unHeard.',
    keywords: ['therapist Electronic City Bangalore', 'online therapy Electronic City', 'counseling Electronic City Bangalore', 'IT professional therapy Electronic City'],
    canonical: `${BASE}/extra-seo/therapist-electronic-city-bangalore`,
    faqs: [
      { q: 'Do you offer evening or weekend slots?', a: 'Yes — we have slots available in the evening and on weekends to work around Electronic City shift timings.' },
      { q: 'I\'ve never tried therapy. Where do I start?', a: 'Your first session is simply a conversation — no pressure, no diagnosis, no expectations. Just understanding.' },
      { q: 'Is online therapy as effective as in-person?', a: 'Research shows online therapy is equally effective for most concerns. And for busy professionals, it\'s often more consistent.' },
    ],
    points: ['Evening and weekend availability', 'No travel — fully online', 'Structured sessions, measurable clarity'],
  },

  {
    id: 'therapist-jp-nagar-bangalore',
    badge: 'JP Nagar',
    category: 'bangalore',
    title: 'JP Nagar: A Quieter Pace, But Mental Health Still Matters.',
    subtitle: 'Families, professionals, and students — JP Nagar is one of Bangalore\'s most established residential areas.',
    body: 'From parenting stress to midlife transitions, relationship difficulties to career anxiety — our therapists serve clients across South Bangalore with structured, evidence-based counseling. Fully online.',
    cta: 'Book a Session',
    metaTitle: 'Online Therapist in JP Nagar Bangalore | unHeard',
    metaDesc: 'Licensed online therapy in JP Nagar, Bangalore. Counseling for families, individuals, and professionals. Book a session at unHeard.',
    keywords: ['therapist JP Nagar Bangalore', 'online therapy JP Nagar', 'counselor JP Nagar Bangalore', 'psychologist South Bangalore'],
    canonical: `${BASE}/extra-seo/therapist-jp-nagar-bangalore`,
    faqs: [
      { q: 'Do you work with families and couples in JP Nagar?', a: 'Yes — we offer individual, couples, and family counseling. All sessions are online so both partners can join from home.' },
      { q: 'Can parents get therapy for their child?', a: 'We work with adolescents (14+) and adults. For younger children, we can guide parents on how to support them effectively.' },
      { q: 'What languages are sessions offered in?', a: 'English and Hindi. We are working on adding Kannada-speaking therapists.' },
    ],
    points: ['Individual, couple, and family therapy', 'Multilingual therapists available', 'South Bangalore serving clients'],
  },

  {
    id: 'therapist-marathahalli-bangalore',
    badge: 'Marathahalli',
    category: 'bangalore',
    title: 'Marathahalli: IT Hubs, Long Commutes, and the Mental Load Nobody Talks About.',
    subtitle: 'Spending 2-3 hours daily in traffic while managing work deliverables takes a real toll — even if it doesn\'t look dramatic from the outside.',
    body: 'Fatigue, irritability, emotional distance at home, and a constant background hum of stress — these are patterns our therapists are trained to understand and work through. Online, flexible, private.',
    cta: 'Start Therapy Today',
    metaTitle: 'Online Therapist in Marathahalli Bangalore | unHeard',
    metaDesc: 'Find a licensed therapist online in Marathahalli, Bangalore. Professional counseling for stress, anxiety, and burnout. Book at unHeard.',
    keywords: ['therapist Marathahalli Bangalore', 'online therapy Marathahalli', 'counseling Marathahalli Bangalore', 'psychologist Marathahalli'],
    canonical: `${BASE}/extra-seo/therapist-marathahalli-bangalore`,
    faqs: [
      { q: 'How long is a typical therapy session?', a: '50–60 minutes, fully online. You can attend from home or office in Marathahalli without commuting anywhere.' },
      { q: 'I feel fine most days. Should I still try therapy?', a: 'Yes — therapy isn\'t only for crisis. Many people use it to understand recurring patterns, manage stress better, and build internal clarity.' },
      { q: 'How many sessions will I need?', a: 'This varies. Some see significant shifts in 6–8 sessions; deeper work may take longer. Your therapist will discuss this with you.' },
    ],
    points: ['No commute — join from anywhere', 'Regular progress check-ins', 'Licensed and trained therapists only'],
  },

  {
    id: 'therapist-jayanagar-bangalore',
    badge: 'Jayanagar',
    category: 'bangalore',
    title: 'Therapy in Jayanagar — For Families, Professionals, and Everyone In Between.',
    subtitle: 'One of Bangalore\'s oldest and most respected residential neighbourhoods deserves quality mental health access.',
    body: 'From exam stress to empty-nest transitions, from midlife questioning to relationship difficulties — unHeard therapists bring professional, structured counseling online to Jayanagar residents.',
    cta: 'Book a Session',
    metaTitle: 'Online Therapist in Jayanagar Bangalore | unHeard',
    metaDesc: 'Online therapy in Jayanagar, Bangalore for individuals and families. Licensed counselors available. Book at unHeard.',
    keywords: ['therapist Jayanagar Bangalore', 'online therapy Jayanagar', 'counselor Jayanagar Bangalore', 'family therapy Jayanagar'],
    canonical: `${BASE}/extra-seo/therapist-jayanagar-bangalore`,
    faqs: [
      { q: 'Do you offer therapy for older adults?', a: 'Yes — we work with adults of all ages. Retirement transitions, health anxiety, and grief are concerns we regularly support.' },
      { q: 'Can I do a trial session first?', a: 'Your first session is a structured consultation — it gives both you and the therapist a chance to understand fit before committing.' },
      { q: 'Are sessions available on weekends?', a: 'Yes — weekend slots are available.' },
    ],
    points: ['All adult age groups served', 'Weekend availability', 'Structured approach to real concerns'],
  },

  {
    id: 'therapist-btm-layout-bangalore',
    badge: 'BTM Layout',
    category: 'bangalore',
    title: 'BTM Layout: Young, Driven, and Quietly Overwhelmed.',
    subtitle: 'Between flatmates, career pivots, and the gap between expectation and reality — many young professionals in BTM Layout are carrying more than they let on.',
    body: 'Our therapists work with young adults navigating early-career anxiety, loneliness, relationship uncertainty, and the mental weight of building a life in a new city.',
    cta: 'Talk to a Therapist',
    metaTitle: 'Online Therapist in BTM Layout Bangalore | unHeard',
    metaDesc: 'Licensed online therapy for young professionals in BTM Layout, Bangalore. Counseling for anxiety, loneliness, and career stress. Book at unHeard.',
    keywords: ['therapist BTM Layout Bangalore', 'online therapy BTM Layout', 'counselor BTM Layout', 'young professional therapy Bangalore'],
    canonical: `${BASE}/extra-seo/therapist-btm-layout-bangalore`,
    faqs: [
      { q: 'Is this right for someone in their 20s?', a: 'Absolutely — many of our clients are 22–35 navigating early adulthood, career uncertainty, and relationship dynamics.' },
      { q: 'What if I\'m not sure what I\'m feeling?', a: 'That\'s actually where therapy starts — helping you name and understand what\'s happening internally.' },
      { q: 'Is this affordable?', a: 'We offer transparent session-based pricing. No hidden fees or long-term contracts.' },
    ],
    points: ['Designed for young adults', 'Transparent pricing', 'Flexible online scheduling'],
  },

  {
    id: 'therapist-malleshwaram-bangalore',
    badge: 'Malleshwaram',
    category: 'bangalore',
    title: 'Malleshwaram: Where Tradition Meets Modern Pressure.',
    subtitle: 'Balancing family expectations, career choices, and personal identity is a real challenge — and one that deserves professional support.',
    body: 'Our therapists understand the intersection of cultural pressure and modern mental health. Structured, evidence-based counseling in a space that respects your context.',
    cta: 'Book a Session',
    metaTitle: 'Online Therapist in Malleshwaram Bangalore | unHeard',
    metaDesc: 'Online therapy in Malleshwaram, Bangalore. Culturally aware counseling for individuals and families managing modern and traditional expectations. Book at unHeard.',
    keywords: ['therapist Malleshwaram Bangalore', 'online therapy Malleshwaram', 'counselor Malleshwaram Bangalore', 'culturally aware therapy Bangalore'],
    canonical: `${BASE}/extra-seo/therapist-malleshwaram-bangalore`,
    faqs: [
      { q: 'Are your therapists culturally aware?', a: 'Yes — our therapists understand Indian family dynamics, cultural expectations, and the tension between personal choices and social pressure.' },
      { q: 'Can I talk about family conflict?', a: 'Family conflict is one of the most common concerns we work with — parent-child dynamics, intergenerational differences, and marital strain.' },
      { q: 'How do I know which therapist is right for me?', a: 'We help match you based on your concerns and preferences during onboarding.' },
    ],
    points: ['Culturally aware therapists', 'Family and individual counseling', 'Confidential and private'],
  },

  {
    id: 'therapist-yelahanka-bangalore',
    badge: 'Yelahanka',
    category: 'bangalore',
    title: 'Yelahanka: North Bangalore\'s Growing Need for Mental Health Support.',
    subtitle: 'Yelahanka is growing fast — with aerospace professionals, defence families, and new residential communities all bringing their own pressures.',
    body: 'Quality mental health support shouldn\'t require a commute to the city centre. unHeard brings licensed therapy online to North Bangalore residents.',
    cta: 'Start Therapy',
    metaTitle: 'Online Therapist in Yelahanka Bangalore | unHeard',
    metaDesc: 'Find a licensed online therapist in Yelahanka, Bangalore. Professional counseling for stress, anxiety, and relationships. Book at unHeard.',
    keywords: ['therapist Yelahanka Bangalore', 'online therapy Yelahanka', 'counselor North Bangalore', 'psychologist Yelahanka'],
    canonical: `${BASE}/extra-seo/therapist-yelahanka-bangalore`,
    faqs: [
      { q: 'Do you serve North Bangalore areas?', a: 'Yes — all sessions are online, so we serve clients across Yelahanka, Hebbal, and all of North Bangalore.' },
      { q: 'What concerns do you help with?', a: 'We work with anxiety, depression, relationship difficulties, career stress, grief, trauma, and more.' },
      { q: 'How do I get started?', a: 'Book online — you\'ll get a confirmation and your first session within 48–72 hours.' },
    ],
    points: ['Serving all of North Bangalore', 'Licensed therapists only', 'Online — no travel required'],
  },

  {
    id: 'therapist-bellandur-bangalore',
    badge: 'Bellandur',
    category: 'bangalore',
    title: 'Bellandur: Where Tech Lives, and So Does Burnout.',
    subtitle: 'One of Bangalore\'s densest IT corridors — Bellandur professionals are among the highest-achieving and highest-pressure people in the city.',
    body: 'Mental fatigue, decision fatigue, relationship strain, and the quiet erosion of identity that comes with always-on work culture. Our therapists help you understand and address these at their root.',
    cta: 'Book a Session',
    metaTitle: 'Online Therapist in Bellandur Bangalore | unHeard',
    metaDesc: 'Online therapy for IT professionals in Bellandur, Bangalore. Licensed counseling for burnout, stress, and anxiety. Book at unHeard.',
    keywords: ['therapist Bellandur Bangalore', 'online therapy Bellandur', 'IT burnout therapy Bangalore', 'counselor Bellandur'],
    canonical: `${BASE}/extra-seo/therapist-bellandur-bangalore`,
    faqs: [
      { q: 'I\'m burnt out but can\'t take time off work. Can therapy still help?', a: 'Yes — sessions are 50 minutes, online, and scheduled around your work calendar. Many clients see meaningful shifts while continuing to work.' },
      { q: 'Do you treat burnout specifically?', a: 'We work with the patterns underlying burnout — perfectionism, avoidance, emotional suppression, and boundary collapse — not just the surface symptoms.' },
      { q: 'How many sessions does burnout recovery take?', a: 'This varies by person. You\'ll discuss a realistic timeline with your therapist after the first session.' },
    ],
    points: ['Schedule around demanding work hours', 'Address root causes, not just symptoms', 'Measurable structure and progress'],
  },

  {
    id: 'therapist-hebbal-bangalore',
    badge: 'Hebbal',
    category: 'bangalore',
    title: 'Hebbal: A City Within a City That Deserves Mental Health Access.',
    subtitle: 'With major business parks, diplomatic zones, and dense residential communities — Hebbal is one of North Bangalore\'s fastest-growing areas.',
    body: 'Whether you\'re a professional, a parent, or simply someone navigating a busy life in a rapidly changing neighbourhood — professional therapy is more accessible than you think.',
    cta: 'Book a Session',
    metaTitle: 'Online Therapist in Hebbal Bangalore | unHeard',
    metaDesc: 'Online therapy in Hebbal, Bangalore. Licensed therapists for individuals and families. Counseling for stress, anxiety, and relationships. Book at unHeard.',
    keywords: ['therapist Hebbal Bangalore', 'online therapy Hebbal', 'counselor North Bangalore', 'psychologist Hebbal'],
    canonical: `${BASE}/extra-seo/therapist-hebbal-bangalore`,
    faqs: [
      { q: 'What makes unHeard different from other platforms?', a: 'We don\'t use scripts or match you with random therapists. Our approach is structured, evidence-based, and genuinely focused on understanding your patterns.' },
      { q: 'Can I switch therapists if we don\'t connect?', a: 'Yes — therapist fit matters. If something doesn\'t feel right, we help you find a better match.' },
      { q: 'Is this covered by health insurance?', a: 'Some corporate insurance plans cover online therapy. Check with your HR or insurance provider.' },
    ],
    points: ['Genuinely structured sessions', 'Therapist fit guaranteed', 'Insurance-friendly invoices available'],
  },

  {
    id: 'therapist-rajajinagar-bangalore',
    badge: 'Rajajinagar',
    category: 'bangalore',
    title: 'Rajajinagar: Old Bangalore, New Mental Health Needs.',
    subtitle: 'In one of Bangalore\'s most established residential zones, the conversation around mental health is still relatively new — but the need has always been there.',
    body: 'From family pressure to career uncertainty, from grief to relationship difficulties — our therapists provide professional, non-judgmental support to Rajajinagar residents. Online, private, effective.',
    cta: 'Talk to a Therapist',
    metaTitle: 'Online Therapist in Rajajinagar Bangalore | unHeard',
    metaDesc: 'Online therapy in Rajajinagar, Bangalore. Licensed counselors for individuals, couples, and families. Book a session at unHeard.',
    keywords: ['therapist Rajajinagar Bangalore', 'online therapy Rajajinagar', 'counselor West Bangalore', 'psychologist Rajajinagar'],
    canonical: `${BASE}/extra-seo/therapist-rajajinagar-bangalore`,
    faqs: [
      { q: 'Is therapy only for people with serious mental illness?', a: 'Not at all. Most of our clients are high-functioning individuals dealing with patterns — stress, overthinking, relationship difficulty — that therapy is highly effective for.' },
      { q: 'What if my family doesn\'t believe in therapy?', a: 'Your sessions are private. You don\'t need family approval to take care of your mental health.' },
      { q: 'Can I pay per session?', a: 'Yes — we offer single sessions and packages. No compulsory long-term commitment.' },
    ],
    points: ['No long-term commitment required', 'Private and confidential', 'For high-functioning individuals too'],
  },

  {
    id: 'therapist-banashankari-bangalore',
    badge: 'Banashankari',
    category: 'bangalore',
    title: 'Banashankari: South Bangalore\'s Quiet Neighbourhood Deserves Loud Support.',
    subtitle: 'Students, families, and working professionals in Banashankari often deal with academic pressure, family expectations, and career uncertainty in silence.',
    body: 'unHeard brings professional mental health support online to South Bangalore — without the stigma, without the commute, and without the wait.',
    cta: 'Start Today',
    metaTitle: 'Online Therapist in Banashankari Bangalore | unHeard',
    metaDesc: 'Licensed online therapy in Banashankari, Bangalore. Counseling for students, families, and professionals. Book at unHeard.',
    keywords: ['therapist Banashankari Bangalore', 'online therapy Banashankari', 'counselor South Bangalore', 'student therapy Bangalore'],
    canonical: `${BASE}/extra-seo/therapist-banashankari-bangalore`,
    faqs: [
      { q: 'Do you offer therapy for students and exam stress?', a: 'Yes — we work with students navigating academic pressure, competitive exam anxiety, identity challenges, and family expectation.' },
      { q: 'What age groups do you serve?', a: 'We work with individuals aged 14 and above.' },
      { q: 'How do I know if I need therapy?', a: 'If recurring thoughts, feelings, or patterns are affecting your daily life, relationships, or work — that\'s enough reason to start.' },
    ],
    points: ['Student and adult counseling', 'Kannada-speaking therapists coming soon', 'Private and online'],
  },

  /* ═══════════════════════════════════════════════════════
     MENTAL HEALTH CONDITIONS  (16–23)
  ═══════════════════════════════════════════════════════ */

  {
    id: 'anxiety-therapy-bangalore',
    badge: 'Anxiety',
    category: 'condition',
    title: 'Anxiety Isn\'t Weakness. It\'s Your Mind Asking for Attention.',
    subtitle: 'Racing thoughts, a body that won\'t settle, and a brain that treats every uncertainty like a threat — anxiety is exhausting. And it\'s treatable.',
    body: 'At unHeard, our therapists don\'t suppress anxiety with affirmations or breathing exercises alone. We work on what drives it — the thought patterns, the beliefs, and the emotional habits that keep the cycle going.',
    cta: 'Start Anxiety Therapy',
    metaTitle: 'Anxiety Therapy Online Bangalore | Licensed Therapists | unHeard',
    metaDesc: 'Online anxiety therapy in Bangalore by licensed therapists. Understand and address anxiety at its root. Evidence-based counseling. Book at unHeard.',
    keywords: ['anxiety therapy Bangalore', 'online anxiety counseling Bangalore', 'generalised anxiety therapist Bangalore', 'anxiety treatment online India'],
    canonical: `${BASE}/extra-seo/anxiety-therapy-bangalore`,
    faqs: [
      { q: 'What types of anxiety do you treat?', a: 'Generalised anxiety, social anxiety, panic disorder, health anxiety, performance anxiety, and OCD-related anxiety.' },
      { q: 'How long does anxiety therapy take?', a: 'Many clients see significant change in 8–12 sessions. Severe anxiety may take longer — your therapist will be honest about what\'s realistic.' },
      { q: 'Do you prescribe medication for anxiety?', a: 'We are a counseling platform, not a psychiatric clinic. We don\'t prescribe medication. If medication is needed, we can refer you to a psychiatrist.' },
    ],
    points: ['Root-cause approach, not suppression', 'CBT, ACT, and other evidence-based methods', 'Licensed therapists with anxiety specialisation'],
  },

  {
    id: 'depression-therapy-bangalore',
    badge: 'Depression',
    category: 'condition',
    title: 'Depression Doesn\'t Always Look Like Sadness. Sometimes It Just Looks Like Tired.',
    subtitle: 'Low motivation. Numbness. The sense that nothing really matters. Depression is quieter than people expect — and more treatable than people believe.',
    body: 'Our therapists understand that depression isn\'t a character flaw or laziness. It\'s a pattern — in how you think, how you feel, and how you relate to yourself and others. We work on all three.',
    cta: 'Talk to a Therapist',
    metaTitle: 'Depression Therapy Online Bangalore | Licensed Counselors | unHeard',
    metaDesc: 'Online depression therapy in Bangalore. Licensed therapists who work on the root patterns — not just the symptoms. Book at unHeard.',
    keywords: ['depression therapy Bangalore', 'online depression counseling Bangalore', 'depression treatment Bangalore', 'therapist for depression Bangalore'],
    canonical: `${BASE}/extra-seo/depression-therapy-bangalore`,
    faqs: [
      { q: 'I\'ve had depression for years. Can therapy still help?', a: 'Yes — even long-standing depression responds to structured therapy. In fact, chronic depression often benefits most from consistent, ongoing work.' },
      { q: 'Is therapy better than antidepressants for depression?', a: 'Both have roles. For mild-to-moderate depression, therapy alone is often highly effective. For severe depression, therapy + medication is often the best combination.' },
      { q: 'What if I can\'t even get motivated to try?', a: 'That\'s the nature of depression. Your first session requires nothing more than showing up. The therapist takes it from there.' },
    ],
    points: ['Chronic and acute depression treated', 'Structured, not open-ended', 'No pressure on pace or progress'],
  },

  {
    id: 'burnout-therapy-bangalore',
    badge: 'Burnout',
    category: 'condition',
    title: 'Burnout Isn\'t "Just Stress." It\'s What Happens When the System Runs Empty.',
    subtitle: 'You\'re still showing up. Still delivering. But inside, something has gone quiet. That\'s burnout — and it doesn\'t go away on its own.',
    body: 'Bangalore\'s work culture glorifies performance. But burnout is the cost of performance without recovery. Our therapists help you identify how you got here, what keeps you stuck, and how to rebuild sustainably.',
    cta: 'Start Recovery',
    metaTitle: 'Burnout Therapy Online Bangalore | Work Stress Counseling | unHeard',
    metaDesc: 'Online burnout therapy in Bangalore for professionals. Address the root of exhaustion, not just the symptoms. Licensed therapists. Book at unHeard.',
    keywords: ['burnout therapy Bangalore', 'work stress counseling Bangalore', 'professional burnout Bangalore', 'exhaustion therapy Bangalore'],
    canonical: `${BASE}/extra-seo/burnout-therapy-bangalore`,
    faqs: [
      { q: 'What\'s the difference between stress and burnout?', a: 'Stress is a temporary response to pressure. Burnout is chronic — it affects motivation, identity, and emotional capacity in ways that don\'t recover with a weekend off.' },
      { q: 'Can I do therapy while still working?', a: 'Yes — and most of our burnout clients do. Sessions are 50 minutes online. You don\'t need to take leave.' },
      { q: 'My employer might be causing my burnout. Can therapy help?', a: 'Yes — therapy helps you understand your patterns, set boundaries, and make decisions about work with clarity rather than desperation.' },
    ],
    points: ['For professionals still in the thick of it', 'Understand the patterns, not just the symptoms', 'Sustainable recovery, not quick fixes'],
  },

  {
    id: 'relationship-counseling-bangalore',
    badge: 'Relationships',
    category: 'condition',
    title: 'When the Person You Love Becomes the Person You Can\'t Reach.',
    subtitle: 'Relationships don\'t break because people stop caring. They break because people stop understanding each other.',
    body: 'Couples therapy at unHeard isn\'t mediation. It\'s structured work on the patterns — communication styles, attachment, defensiveness, and the emotional habits that create distance even when love is still present.',
    cta: 'Book Couples Therapy',
    metaTitle: 'Relationship Counseling Bangalore | Couples Therapy Online | unHeard',
    metaDesc: 'Online couples therapy and relationship counseling in Bangalore. Structured, evidence-based support for communication, trust, and emotional connection. Book at unHeard.',
    keywords: ['relationship counseling Bangalore', 'couples therapy Bangalore', 'marriage counseling Bangalore', 'online relationship therapy Bangalore'],
    canonical: `${BASE}/extra-seo/relationship-counseling-bangalore`,
    faqs: [
      { q: 'Can we both attend from different locations?', a: 'Yes — one partner can join from office, the other from home. Sessions are fully online.' },
      { q: 'Do you only work with married couples?', a: 'No — we work with any committed relationship: dating, engaged, married, or long-term partnerships.' },
      { q: 'What if only one of us wants therapy?', a: 'Individual therapy can still address relationship patterns. One person changing how they show up often shifts the entire dynamic.' },
    ],
    points: ['For dating, engaged, and married couples', 'Both partners can join from different locations', 'Structured, not open-ended venting'],
  },

  {
    id: 'ocd-therapy-bangalore',
    badge: 'OCD',
    category: 'condition',
    title: 'OCD Is Not About Being Neat. It\'s About a Mind That Won\'t Let Go.',
    subtitle: 'Intrusive thoughts, compulsive rituals, and the exhausting certainty that something bad will happen if you don\'t check, count, or repeat — OCD is treatable.',
    body: 'OCD is one of the most misunderstood conditions. At unHeard, our therapists are trained in ERP (Exposure and Response Prevention) — the gold-standard evidence-based treatment for OCD.',
    cta: 'Book OCD Therapy',
    metaTitle: 'OCD Therapy Online Bangalore | ERP Counseling | unHeard',
    metaDesc: 'Online OCD therapy in Bangalore using evidence-based ERP. Licensed therapists who understand obsessive-compulsive patterns. Book at unHeard.',
    keywords: ['OCD therapy Bangalore', 'online OCD counseling Bangalore', 'ERP therapy Bangalore', 'OCD treatment Bangalore'],
    canonical: `${BASE}/extra-seo/ocd-therapy-bangalore`,
    faqs: [
      { q: 'What is ERP and why is it used for OCD?', a: 'Exposure and Response Prevention is the most evidence-backed treatment for OCD. It gradually reduces the power of intrusive thoughts by helping you tolerate uncertainty without performing rituals.' },
      { q: 'Can OCD be cured?', a: 'OCD is manageable — most people with OCD can reach a point where it no longer controls their daily life. Full remission is possible for many.' },
      { q: 'Does online therapy work for OCD?', a: 'Yes — ERP has been shown to be equally effective online as in-person in clinical research.' },
    ],
    points: ['ERP — gold standard OCD treatment', 'Trained OCD specialists', 'Online format is equally effective'],
  },

  {
    id: 'trauma-therapy-bangalore',
    badge: 'Trauma',
    category: 'condition',
    title: 'Trauma Doesn\'t Live in the Past. It Lives in the Body, the Present, and the Patterns.',
    subtitle: 'Flashbacks, hypervigilance, emotional numbness, and triggers that make no sense on the surface — trauma is the nervous system trying to protect you from something that already happened.',
    body: 'Our therapists are trained in trauma-informed approaches — working at a pace that feels safe, with evidence-based methods including EMDR-informed techniques and somatic awareness.',
    cta: 'Book Trauma Therapy',
    metaTitle: 'Trauma Therapy Online Bangalore | PTSD Counseling | unHeard',
    metaDesc: 'Online trauma therapy in Bangalore. Licensed therapists using trauma-informed, evidence-based approaches. Safe, structured, and confidential. Book at unHeard.',
    keywords: ['trauma therapy Bangalore', 'PTSD counseling Bangalore', 'trauma-informed therapy Bangalore', 'online PTSD treatment Bangalore'],
    canonical: `${BASE}/extra-seo/trauma-therapy-bangalore`,
    faqs: [
      { q: 'I\'m not sure if what I experienced counts as trauma. Should I still come?', a: 'Yes. Trauma is defined by its impact, not its cause. If something is affecting how you function, feel, or relate to others — it\'s worth addressing.' },
      { q: 'Do I have to talk about the traumatic event in detail?', a: 'No — trauma therapy doesn\'t require you to relive the event in detail. Modern approaches work at your pace and focus on reducing impact rather than re-exposure.' },
      { q: 'Is online trauma therapy safe?', a: 'Yes — with a trained therapist and proper pacing, online trauma therapy is safe and effective. Your therapist will set appropriate boundaries from the start.' },
    ],
    points: ['Trauma-informed, not re-traumatising', 'Pace set by you', 'EMDR-informed and somatic awareness'],
  },

  {
    id: 'grief-counseling-bangalore',
    badge: 'Grief',
    category: 'condition',
    title: 'Grief Has No Timeline. But You Don\'t Have to Carry It Alone.',
    subtitle: 'Loss doesn\'t follow a five-stage model. It\'s messy, non-linear, and sometimes doesn\'t arrive until years after the loss itself.',
    body: 'Whether you\'ve lost a person, a relationship, a future you expected, or a version of yourself — grief is real and it deserves professional support. Our therapists provide structured, compassionate grief counseling online.',
    cta: 'Book Grief Counseling',
    metaTitle: 'Grief Counseling Online Bangalore | Bereavement Support | unHeard',
    metaDesc: 'Online grief counseling in Bangalore. Licensed therapists providing compassionate, structured support for loss and bereavement. Book at unHeard.',
    keywords: ['grief counseling Bangalore', 'bereavement therapy Bangalore', 'loss therapy Bangalore', 'grief therapist Bangalore'],
    canonical: `${BASE}/extra-seo/grief-counseling-bangalore`,
    faqs: [
      { q: 'How long should grief last?', a: 'There is no fixed timeline. Grief is individual. Therapy helps you move through it with support — not on a prescribed schedule.' },
      { q: 'I lost someone two years ago and I\'m still not okay. Is that normal?', a: 'Yes. Complicated grief — grief that persists and deeply disrupts life — is common and very treatable with professional support.' },
      { q: 'Can grief therapy help with anticipatory grief?', a: 'Yes — grieving a loss before it happens (a terminal diagnosis, a relationship ending) is a real experience we work with.' },
    ],
    points: ['No timeline pressure', 'Complicated and disenfranchised grief supported', 'Compassionate and structured'],
  },

  {
    id: 'teen-therapy-bangalore',
    badge: 'Teen Therapy',
    category: 'condition',
    title: 'Adolescence Is Not Just a Phase. It\'s One of the Hardest Chapters.',
    subtitle: 'Academic pressure, social media, identity, relationships, family expectations — today\'s teenagers are navigating more than any generation before them.',
    body: 'Our adolescent therapists are trained to work with teens (14+) in a way that feels real, not clinical. We don\'t lecture. We listen, and we help them understand what\'s happening inside.',
    cta: 'Book Teen Therapy',
    metaTitle: 'Teen Therapy Online Bangalore | Adolescent Counseling | unHeard',
    metaDesc: 'Online therapy for teenagers in Bangalore. Licensed adolescent therapists for exam stress, social anxiety, identity, and emotional wellbeing. Book at unHeard.',
    keywords: ['teen therapy Bangalore', 'adolescent counseling Bangalore', 'therapy for teenagers Bangalore', 'student mental health Bangalore'],
    canonical: `${BASE}/extra-seo/teen-therapy-bangalore`,
    faqs: [
      { q: 'Can my teenager attend therapy without me in the room?', a: 'Yes — sessions are confidential, one-on-one. Teens often open up more without parents present. We keep parents informed about general progress with the teen\'s consent.' },
      { q: 'What age group counts as a teenager for therapy?', a: 'We work with adolescents aged 14–19 in our teen therapy programme.' },
      { q: 'My child refuses to try therapy. What do I do?', a: 'This is common. We can first work with you as a parent on how to create the conditions where your child feels safe trying it.' },
    ],
    points: ['Confidential teen sessions', 'Age-appropriate, non-clinical approach', 'Parent guidance sessions also available'],
  },

  /* ═══════════════════════════════════════════════════════
     AWARENESS / CULTURAL PAGES  (24–30)
  ═══════════════════════════════════════════════════════ */

  {
    id: 'chatgpt-is-not-a-therapist',
    badge: 'AI & Therapy',
    category: 'awareness',
    title: 'ChatGPT Is Not a Therapist. Here\'s Why It Matters.',
    subtitle: 'AI can answer your questions, validate your feelings, and even sound like it cares. But it cannot do what therapy does — and confusing the two can delay real help.',
    body: 'This page isn\'t a criticism of AI. It\'s an honest explanation of what therapy does that AI cannot: understand your patterns over time, hold you accountable, work through resistance, and form a real therapeutic relationship. These are not features. They are the mechanism of change.',
    cta: 'Talk to a Real Therapist',
    metaTitle: 'ChatGPT Is Not a Therapist | Why AI Can\'t Replace Counseling | unHeard',
    metaDesc: 'Understand why AI chatbots like ChatGPT cannot replace real therapy. Therapy is a relationship, not a response. Book a session with a licensed therapist at unHeard.',
    keywords: ['ChatGPT therapy', 'AI vs therapist', 'is ChatGPT a therapist', 'can AI replace therapy', 'online therapy vs AI'],
    canonical: `${BASE}/extra-seo/chatgpt-is-not-a-therapist`,
    faqs: [
      { q: 'What can ChatGPT do that therapy can\'t?', a: 'AI can provide information instantly, at any hour, for free. It can explain mental health concepts, offer coping suggestions, and create a sense of being heard in the moment.' },
      { q: 'What can therapy do that ChatGPT can\'t?', a: 'A therapist knows your history. They notice patterns you can\'t see. They push back when you\'re avoiding. They hold a relationship that creates the conditions for real change. AI does none of this.' },
      { q: 'Is using AI a problem if I\'m also in therapy?', a: 'Not necessarily. AI can be a useful supplement — for information or between-session support. The risk is when it becomes a substitute that delays real help.' },
    ],
    points: ['Therapy is a relationship, not a response', 'AI cannot track patterns across time', 'Real change requires real accountability'],
  },

  {
    id: 'self-care-is-not-enough',
    badge: 'Self-Care',
    category: 'awareness',
    title: 'Self-Care Won\'t Fix What Therapy Is Designed to Address.',
    subtitle: 'Baths, journaling, and gym sessions are valuable. But they are maintenance, not repair. If something is genuinely broken, maintenance isn\'t enough.',
    body: 'The wellness industry has made self-care the answer to everything. But anxiety, depression, trauma, and deep relational patterns don\'t respond to bubble baths. They respond to structured psychological work.',
    cta: 'Book Real Support',
    metaTitle: 'Why Self-Care Is Not Enough | When to See a Therapist | unHeard',
    metaDesc: 'Self-care has limits. Learn when therapy is what you actually need — not more wellness routines. Licensed therapists at unHeard, Bangalore.',
    keywords: ['self-care not enough', 'when to see a therapist', 'self-care vs therapy', 'mental health beyond self-care', 'therapy vs wellness'],
    canonical: `${BASE}/extra-seo/self-care-is-not-enough`,
    faqs: [
      { q: 'When should I choose therapy over self-care?', a: 'When the same patterns keep repeating despite your efforts. When journaling the same thing for the third year hasn\'t changed anything. When the coping is taking more energy than the problem.' },
      { q: 'Can I do self-care and therapy at the same time?', a: 'Absolutely — they complement each other. Therapy creates insight; self-care supports the nervous system while you do the work.' },
      { q: 'Is therapy only for people in crisis?', a: 'No — many of our clients are high-functioning people who want to understand themselves better. Therapy is not an emergency measure.' },
    ],
    points: ['Self-care maintains; therapy repairs', 'Patterns don\'t resolve with routines alone', 'Therapy is not a crisis measure — it\'s preventive too'],
  },

  {
    id: 'mental-health-stigma-bangalore',
    badge: 'Stigma',
    category: 'awareness',
    title: 'Bangalore Is Modern. Its Mental Health Stigma Doesn\'t Have to Be.',
    subtitle: 'The city is full of progressive, educated, high-achieving people — many of whom still think seeking therapy is a sign of weakness.',
    body: 'Stigma isn\'t logical. It\'s cultural. And it prevents real people from getting real help. This page is about naming that directly — and offering an alternative.',
    cta: 'Take the First Step',
    metaTitle: 'Mental Health Stigma in Bangalore | Breaking the Silence | unHeard',
    metaDesc: 'Mental health stigma in Bangalore is real — and it\'s costing people real wellbeing. Read why seeking therapy is a strength, and book at unHeard.',
    keywords: ['mental health stigma Bangalore', 'therapy stigma India', 'mental health awareness Bangalore', 'normalising therapy India'],
    canonical: `${BASE}/extra-seo/mental-health-stigma-bangalore`,
    faqs: [
      { q: 'What if my family finds out I\'m seeing a therapist?', a: 'Sessions are completely private. No information is shared with family members without your explicit consent.' },
      { q: 'Is therapy becoming more accepted in India?', a: 'Yes — particularly in urban India and among younger generations. Stigma is reducing, but it\'s still a real barrier for many.' },
      { q: 'How do I deal with family resistance to therapy?', a: 'This is something we can work through in therapy itself. Many clients navigate this without family awareness.' },
    ],
    points: ['100% confidential sessions', 'Stigma addressed in session if needed', 'Private — no one needs to know'],
  },

  {
    id: 'online-therapy-vs-in-person-bangalore',
    badge: 'Online vs In-Person',
    category: 'awareness',
    title: 'Online Therapy vs. In-Person: What Actually Works Better?',
    subtitle: 'The research might surprise you. And for Bangalore\'s traffic and busy schedules, the answer has practical implications.',
    body: 'Multiple clinical studies show online therapy is as effective as in-person therapy for depression, anxiety, PTSD, and relationship issues. For people in Bangalore — where commuting to a clinic can add 2 hours to a session — this matters.',
    cta: 'Try Online Therapy',
    metaTitle: 'Online Therapy vs In-Person Bangalore | What Works Better? | unHeard',
    metaDesc: 'Is online therapy as effective as in-person? Research says yes — especially for anxiety, depression, and relationship issues. Book with unHeard in Bangalore.',
    keywords: ['online therapy vs in-person Bangalore', 'is online therapy effective', 'online counseling effectiveness', 'telehealth therapy Bangalore'],
    canonical: `${BASE}/extra-seo/online-therapy-vs-in-person-bangalore`,
    faqs: [
      { q: 'Is online therapy as effective as in-person?', a: 'Yes — for most common concerns including depression, anxiety, OCD, trauma, and relationship issues, research consistently shows equivalent effectiveness.' },
      { q: 'Are there cases where in-person is better?', a: 'Severe psychosis, active suicidality, and cases requiring physical observation sometimes need in-person care. For the vast majority of clients, online works equally well.' },
      { q: 'Do I need special software or equipment?', a: 'Just a smartphone or laptop with a stable internet connection. We use a simple, secure video platform.' },
    ],
    points: ['Clinically equivalent to in-person', 'Saves 1-2 hours of Bangalore traffic per session', 'Accessible from anywhere in India'],
  },

  {
    id: 'work-life-balance-therapy-bangalore',
    badge: 'Work-Life Balance',
    category: 'awareness',
    title: 'Work-Life Balance Isn\'t a Scheduling Problem. It\'s a Mental Health Problem.',
    subtitle: 'You can rearrange your calendar a hundred times and still feel like work owns you. That\'s because the problem isn\'t in your schedule.',
    body: 'The inability to disconnect from work is often rooted in deeper patterns — perfectionism, fear of failure, a need for external validation, or an identity that\'s become entirely work-dependent. Therapy addresses these at the source.',
    cta: 'Book a Session',
    metaTitle: 'Work-Life Balance Therapy Bangalore | Professional Burnout Support | unHeard',
    metaDesc: 'Struggling with work-life balance in Bangalore? Therapy addresses the root — not just the schedule. Book with a licensed therapist at unHeard.',
    keywords: ['work-life balance therapy Bangalore', 'work stress counseling Bangalore', 'professional burnout therapy', 'overwork mental health Bangalore'],
    canonical: `${BASE}/extra-seo/work-life-balance-therapy-bangalore`,
    faqs: [
      { q: 'My company culture makes balance impossible. Can therapy help with that?', a: 'Therapy can help you understand your own patterns within a difficult system — and make clearer decisions about what you can change vs. what requires different choices.' },
      { q: 'Is work-life balance really a therapy issue?', a: 'Often yes — when it persists despite external changes, it\'s a psychological pattern, not a logistical one.' },
      { q: 'How many sessions does this usually take?', a: 'Many clients see meaningful shifts in 6–10 sessions. Your therapist will give you an honest assessment after the first session.' },
    ],
    points: ['Address the pattern, not just the schedule', 'Built for Bangalore\'s professional culture', 'Measurable change in 6-10 sessions for most'],
  },

  {
    id: 'loneliness-therapy-bangalore',
    badge: 'Loneliness',
    category: 'awareness',
    title: 'Bangalore Is Full of People. Many of Them Are Lonely.',
    subtitle: 'Moving to a new city, losing a relationship, or just feeling disconnected despite a full social calendar — loneliness is one of the most common and least-discussed mental health concerns.',
    body: 'Loneliness isn\'t about being alone. It\'s about the quality of connection — to others, and to yourself. Our therapists help you understand what\'s getting in the way.',
    cta: 'Start Therapy',
    metaTitle: 'Loneliness Therapy Bangalore | Connection and Isolation Support | unHeard',
    metaDesc: 'Feeling lonely in Bangalore? Therapy helps address isolation, disconnection, and the patterns that keep real connection out of reach. Book at unHeard.',
    keywords: ['loneliness therapy Bangalore', 'isolation counseling Bangalore', 'social anxiety therapy Bangalore', 'feeling alone in Bangalore'],
    canonical: `${BASE}/extra-seo/loneliness-therapy-bangalore`,
    faqs: [
      { q: 'Is loneliness a mental health issue?', a: 'Chronic loneliness is linked to depression, anxiety, and poor physical health outcomes. It\'s a serious concern that responds well to therapy.' },
      { q: 'I have friends but still feel lonely. Is that possible?', a: 'Yes — this is very common. Loneliness is about depth and quality of connection, not quantity. Therapy helps you understand why surface connections don\'t feel satisfying.' },
      { q: 'How can therapy help with loneliness?', a: 'By addressing what\'s creating the disconnection — often avoidance, fear of intimacy, social anxiety, or unresolved grief. Real connection becomes possible once those patterns shift.' },
    ],
    points: ['Loneliness is treatable', 'Address depth, not just social quantity', 'Online — you can start without even leaving home'],
  },

];

/** Get one page by id slug. */
export function getExtraSeoPage(id: string): ExtraSeoPage | undefined {
  return EXTRA_SEO_PAGES.find((p) => p.id === id);
}

/** Get all pages in a specific category */
export function getExtraSeoByCategory(cat: ExtraSeoPage['category']): ExtraSeoPage[] {
  return EXTRA_SEO_PAGES.filter((p) => p.category === cat);
}

/** Get previous and next page for chain linking */
export function getAdjacentPages(id: string): { prev: ExtraSeoPage | null; next: ExtraSeoPage | null } {
  const idx = EXTRA_SEO_PAGES.findIndex((p) => p.id === id);
  return {
    prev: idx > 0                             ? EXTRA_SEO_PAGES[idx - 1] : null,
    next: idx < EXTRA_SEO_PAGES.length - 1   ? EXTRA_SEO_PAGES[idx + 1] : null,
  };
}
