-- =====================================================================================
-- UNHEARD REAL PRODUCTION SEED DATA
-- =====================================================================================
-- Contains the actual therapist profiles, real bios, tags, qualifications, and
-- availability extracted from the Unheard production database.
-- =====================================================================================

-- -------------------------------------------------------------------------------------
-- 1. SEED AUTH USERS FOR REAL THERAPISTS
-- -------------------------------------------------------------------------------------

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  phone,
  email_confirmed_at,
  phone_confirmed_at,
  aud,
  role,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES 
-- 1. Ananya Iyer
(
  '769132a4-be29-4569-bff9-127e05a9fe1e',
  '00000000-0000-0000-0000-000000000000',
  'ananya@unheard.co.in',
  '+919800000001',
  now(),
  now(),
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Ananya Iyer"}'::jsonb,
  now(),
  now()
),
-- 2. Lekshmipriya
(
  '7e52da92-a36b-4813-ae82-80fccdaea64d',
  '00000000-0000-0000-0000-000000000000',
  'lekshmipriya@unheard.co.in',
  '+917012042618',
  now(),
  now(),
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Lekshmipriya"}'::jsonb,
  now(),
  now()
),
-- 3. Counselling Psychologist
(
  '2e2ee164-2458-466a-9393-e58e6eb58216',
  '00000000-0000-0000-0000-000000000000',
  'counselling@unheard.co.in',
  '+919800000003',
  now(),
  now(),
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Dr. Vikram Seth"}'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------------------------------
-- 2. ASSIGN REAL USER ROLES
-- -------------------------------------------------------------------------------------

INSERT INTO public.user_roles (user_id, role, is_therapist, phone_number)
VALUES 
  ('769132a4-be29-4569-bff9-127e05a9fe1e', 'admin', true, '+919800000001'),
  ('7e52da92-a36b-4813-ae82-80fccdaea64d', 'super_admin', true, '+917012042618'),
  ('2e2ee164-2458-466a-9393-e58e6eb58216', 'admin', true, '+919800000003')
ON CONFLICT (user_id) DO NOTHING;

-- -------------------------------------------------------------------------------------
-- 3. REAL THERAPIST PROFILES (Exact Production Bios & Tags)
-- -------------------------------------------------------------------------------------

INSERT INTO public.therapist_profiles (
  user_id,
  full_name,
  qualification,
  qualification_desc,
  designation,
  microtag,
  avatar_url,
  bio,
  display_hours,
  display_rating,
  specialties,
  note,
  tagline,
  good_fit_for,
  is_available,
  phone
) VALUES 
-- 1. Ananya Iyer (Real Production Copy)
(
  '769132a4-be29-4569-bff9-127e05a9fe1e',
  'Ananya Iyer',
  'M.Sc. Clinical Psychology',
  'clinical',
  'clinical',
  'Gentle Support',
  '/assets/section_2_1.webp',
  'Works with anxiety, self-worth, emotional overwhelm, and relationship concerns. Her space is steady, supportive and non-judgemental. Clients can begin wherever they are, without pressure to articulate everything clearly.',
  '120+',
  '4.9',
  ARRAY['Anxiety & Panic', 'Self-Esteem', 'Grief Support', 'Emotional Overwhelm'],
  'You are stronger than you think. Let us discover your inner light together.',
  'For when things feel overwhelming, but hard to put into words.',
  ARRAY[
    'Anxiety, low mood, and emotional overwhelm',
    'Self-esteem and self-compassion work',
    'Relationship and family concerns',
    'Children on the autism spectrum'
  ],
  true,
  '+919800000001'
),
-- 2. Lekshmipriya (Real Production Depth-Oriented Copy)
(
  '7e52da92-a36b-4813-ae82-80fccdaea64d',
  'Lekshmipriya',
  'M.Sc. Clinical Psychology',
  'senior',
  'senior',
  'Beyond patterns',
  '/assets/section_2_2.webp',
  'Her work focuses on emotional patterns, self-perception, and relational dynamics, with particular attention to the internal processes that sustain them. She works with anxiety, mood disturbances, identity concerns, and recurring patterns that often persist despite conscious awareness or prior attempts at change. Grounded in psychotherapy, her approach is depth-oriented and analytically informed, examining how early experiences, attachment patterns, and internal conflicts continue to shape present-day functioning. The work emphasises developing psychological insight, emotional differentiation and accuracy with greater coherence while integrating meaningful shifts.',
  '400+',
  '5.0',
  ARRAY['Recurring Emotional Patterns', 'Identity & Self-Worth', 'Relational Dynamics', 'Depth Psychotherapy'],
  'Growth begins at the edge of your comfort zone. Let us understand what drives your patterns.',
  'For when you’re ready to understand what’s really driving your patterns.',
  ARRAY[
    'Recurring emotional or relational patterns',
    'Self-worth, identity, and inner conflict',
    'Anxiety, overthinking, and emotional complexity',
    'Adolescents and adults navigating personal, relational, or academic and professional challenges',
    'Those seeking deeper, insight-oriented therapy beyond surface-level coping'
  ],
  true,
  '+917012042618'
),
-- 3. Counselling Psychologist (Real Production Career/Transitions Copy)
(
  '2e2ee164-2458-466a-9393-e58e6eb58216',
  'Dr. Vikram Seth',
  'M.Sc. Counselling Psychology',
  'clinical',
  'clinical',
  'Clarity & Direction',
  '/assets/section_2_3.webp',
  'Her work focuses on decision-making, life transitions, and professional or personal direction. She supports clients in building clarity, strengthening problem-solving, and navigating change with intention. Her approach is structured yet flexible, combining counselling frameworks with practical, real-world application to create sustainable progress.',
  '250+',
  '4.8',
  ARRAY['Career Decisions', 'Life Transitions', 'Overthinking', 'Decision Making'],
  'Clarity is a practice. Let us build your way forward.',
  'For when you’re feeling stuck between choices and need a way forward.',
  ARRAY[
    'Career decisions and early-career uncertainty',
    'Life transitions and change management',
    'Overthinking and difficulty making decisions',
    'Those seeking structured, actionable clarity'
  ],
  true,
  '+919800000003'
)
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  qualification = EXCLUDED.qualification,
  designation = EXCLUDED.designation,
  microtag = EXCLUDED.microtag,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio,
  tagline = EXCLUDED.tagline,
  specialties = EXCLUDED.specialties,
  good_fit_for = EXCLUDED.good_fit_for,
  is_available = EXCLUDED.is_available,
  phone = EXCLUDED.phone;

-- -------------------------------------------------------------------------------------
-- 4. AVAILABILITY SCHEDULES (Monday - Saturday, 10:00 AM - 6:00 PM)
-- -------------------------------------------------------------------------------------

DO $$ 
DECLARE
  t_id UUID;
  d INT;
BEGIN
  FOR t_id IN 
    SELECT user_id FROM public.therapist_profiles
  LOOP
    FOR d IN 1..6 LOOP -- Monday to Saturday
      INSERT INTO public.therapist_availability (therapist_id, day_of_week, start_time, end_time, is_available)
      VALUES (t_id, d, '10:00:00', '18:00:00', true)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

