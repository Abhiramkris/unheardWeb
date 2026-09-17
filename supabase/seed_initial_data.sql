-- =====================================================================================
-- UNHEARD INITIAL SEED DATA
-- =====================================================================================
-- Run this script in your Supabase SQL Editor AFTER running master_schema.sql.
-- Provisions the baseline therapists, availability schedules, and admin access.
-- =====================================================================================

-- -------------------------------------------------------------------------------------
-- 1. SEED AUTH USERS FOR THERAPISTS
-- -------------------------------------------------------------------------------------
-- Supabase requires a matching user in auth.users before creating therapist profiles.

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
-- Therapist 1: Ananya Iyer (Standard Clinical Psychologist)
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
-- Therapist 2: Dr. Vikram Seth (Senior Psychologist)
(
  '2e2ee164-2458-466a-9393-e58e6eb58216',
  '00000000-0000-0000-0000-000000000000',
  'vikram@unheard.co.in',
  '+919800000002',
  now(),
  now(),
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Dr. Vikram Seth"}'::jsonb,
  now(),
  now()
),
-- Therapist 3: Sarah Jenkins (Standard Clinical Psychologist)
(
  '3c3ee164-2458-466a-9393-e58e6eb58333',
  '00000000-0000-0000-0000-000000000000',
  'sarah@unheard.co.in',
  '+919800000003',
  now(),
  now(),
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Sarah Jenkins"}'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------------------------------
-- 2. ASSIGN THERAPIST USER ROLES
-- -------------------------------------------------------------------------------------

INSERT INTO public.user_roles (user_id, role, is_therapist, phone_number)
VALUES 
  ('769132a4-be29-4569-bff9-127e05a9fe1e', 'admin', true, '+919800000001'),
  ('2e2ee164-2458-466a-9393-e58e6eb58216', 'admin', true, '+919800000002'),
  ('3c3ee164-2458-466a-9393-e58e6eb58333', 'admin', true, '+919800000003')
ON CONFLICT (user_id) DO NOTHING;

-- -------------------------------------------------------------------------------------
-- 3. THERAPIST PROFILES
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
(
  '769132a4-be29-4569-bff9-127e05a9fe1e',
  'Ananya Iyer',
  'M.Sc. Clinical Psychology',
  'clinical',
  'clinical',
  'Gentle Support',
  '/assets/section_2_1.webp',
  'Works with anxiety, self-worth, emotional overwhelm, and relationship concerns. Her space is steady, supportive, and non-judgemental. Clients can begin wherever they are, without pressure to articulate everything clearly.',
  '120+',
  '4.9',
  ARRAY['Grief Support', 'Trauma Recovery', 'Self-Esteem', 'Anxiety'],
  'You are stronger than you think. Let us discover your inner light together.',
  'For when things feel overwhelming, but hard to put into words.',
  ARRAY[
    'Anxiety, low mood, and emotional overwhelm',
    'Self-esteem and self-compassion work',
    'Relationship and family concerns',
    'Young adults navigating transitions'
  ],
  true,
  '+919800000001'
),
(
  '2e2ee164-2458-466a-9393-e58e6eb58216',
  'Dr. Vikram Seth',
  'Ph.D. Counseling Psychology',
  'senior',
  'senior',
  'Clarity & Direction',
  '/assets/section_2_2.webp',
  'With over 10 years of clinical experience, Dr. Vikram specializes in high-stress lifestyle management, career burnout, identity concerns, and couple dynamics. His approach combines psychotherapy with structured problem-solving.',
  '400+',
  '5.0',
  ARRAY['Career Burnout', 'Stress Management', 'Couple Counseling', 'Decision Making'],
  'Growth begins at the edge of your comfort zone. Let us take the first step together.',
  'For when you’re feeling stuck between choices and need a clear way forward.',
  ARRAY[
    'Career decisions and early-career uncertainty',
    'Life transitions and change management',
    'Overthinking and difficulty making decisions',
    'Couples seeking structured relationship clarity'
  ],
  true,
  '+919800000002'
),
(
  '3c3ee164-2458-466a-9393-e58e6eb58333',
  'Sarah Jenkins',
  'M.Sc. Cognitive Science',
  'clinical',
  'clinical',
  'Anxiety Specialist',
  '/assets/section_2_3.webp',
  'Sarah focuses on anxiety disorders, panic control, and obsessive-compulsive patterns. She utilizes evidence-based Cognitive Behavioral Therapy (CBT) and Exposure Response Prevention (ERP) to help clients regain peace of mind.',
  '250+',
  '4.8',
  ARRAY['Anxiety & Panic', 'OCD', 'Social Anxiety', 'Self-Esteem'],
  'Anxiety is a wave you can learn to surf. Let us find your balance.',
  'Specialized cognitive support for anxiety and overthinking.',
  ARRAY[
    'Individuals experiencing general anxiety',
    'People dealing with sudden panic attacks',
    'Managing recurring obsessive thoughts',
    'Building steady confidence in social spaces'
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
  is_available = EXCLUDED.is_available;

-- -------------------------------------------------------------------------------------
-- 4. THERAPIST AVAILABILITY SCHEDULES (Monday - Saturday, 10:00 AM - 6:00 PM)
-- -------------------------------------------------------------------------------------

DO $$ 
DECLARE
  t_id UUID;
  d INT;
BEGIN
  FOR t_id IN 
    SELECT user_id FROM public.therapist_profiles
  LOOP
    FOR d IN 1..6 LOOP -- 1 = Monday to 6 = Saturday
      INSERT INTO public.therapist_availability (therapist_id, day_of_week, start_time, end_time, is_available)
      VALUES (t_id, d, '10:00:00', '18:00:00', true)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- -------------------------------------------------------------------------------------
-- 5. SUPER ADMIN SETUP INSTRUCTIONS
-- -------------------------------------------------------------------------------------
-- To make your own personal account the Super Admin:
-- 1. Log in on your website (e.g. /login) using your real phone number to create your auth account.
-- 2. Run the command below in the SQL Editor with your phone number:
--
-- UPDATE public.user_roles 
-- SET role = 'super_admin' 
-- WHERE phone_number = '+919XXXXXXXXX'; -- Replace with your phone
-- -------------------------------------------------------------------------------------

