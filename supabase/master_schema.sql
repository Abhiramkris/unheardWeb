-- =====================================================================================
-- UNHEARD COMPLETE MASTER SCHEMA
-- =====================================================================================
-- Single-file unified database schema for unHeard platform.
-- Contains all Tables, Enums, Foreign Keys, Indexes, Storage Buckets, and RLS Policies.
-- Safe for fresh Supabase projects.
-- =====================================================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'blogger', 'patient');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================================================
-- 2. CORE USERS & ROLES
-- =====================================================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    role user_role DEFAULT 'patient' NOT NULL,
    is_therapist BOOLEAN DEFAULT FALSE NOT NULL,
    is_blogger BOOLEAN DEFAULT FALSE NOT NULL,
    phone_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================================================
-- 3. THERAPIST PROFILES & AVAILABILITY
-- =====================================================================================

CREATE TABLE IF NOT EXISTS public.therapist_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    bio TEXT,
    qualification TEXT,
    qualification_desc TEXT,
    designation TEXT DEFAULT 'clinical', -- 'clinical' (Standard) | 'senior' (Senior Psychologist)
    consultation_hours INT DEFAULT 0,
    display_hours TEXT DEFAULT '0+',
    ratings DECIMAL(2,1) DEFAULT 5.0,
    display_rating TEXT DEFAULT '5.0',
    specialties TEXT[] DEFAULT '{}',
    note TEXT,
    next_available_at TEXT,
    avatar_url TEXT,
    phone TEXT,
    pricing JSONB DEFAULT 'null'::jsonb,
    is_available BOOLEAN DEFAULT TRUE,
    microtag TEXT,
    tagline TEXT,
    good_fit_for TEXT[] DEFAULT '{}',
    device_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.therapist_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================================================
-- 4. QUESTIONNAIRES & APPOINTMENTS
-- =====================================================================================

CREATE TABLE IF NOT EXISTS public.pre_booking_questionnaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID,
    patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    guest_name TEXT,
    guest_phone TEXT,
    guest_email TEXT,
    requested_start_time TIMESTAMP WITH TIME ZONE,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_trial BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'pending',
    payment_id TEXT,
    amount DECIMAL(10,2) DEFAULT 0,
    transaction_id TEXT,
    order_id TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    payment_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pre_booking_id UUID REFERENCES public.pre_booking_questionnaires(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    therapist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status appointment_status DEFAULT 'pending' NOT NULL,
    assignment_status TEXT DEFAULT 'pending', -- 'pending', 'allotted'
    registration_status TEXT DEFAULT 'new',   -- 'new', 'returning'
    is_trial BOOLEAN DEFAULT FALSE,
    meeting_link TEXT,
    guest_name TEXT,
    guest_email TEXT,
    guest_phone TEXT,
    reminded_6h_patient BOOLEAN DEFAULT FALSE,
    reminded_3h_patient BOOLEAN DEFAULT FALSE,
    reminded_15m_patient BOOLEAN DEFAULT FALSE,
    reminded_15m_therapist BOOLEAN DEFAULT FALSE,
    joined_at_patient TIMESTAMP WITH TIME ZONE,
    joined_at_therapist TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    session_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add foreign key link from questionnaires to appointments
DO $$ BEGIN
    ALTER TABLE public.pre_booking_questionnaires
    ADD CONSTRAINT fk_questionnaire_appointment
    FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================================================
-- 5. AUTH, SECURITY & ANTI-EXPLOIT
-- =====================================================================================

CREATE TABLE IF NOT EXISTS public.booking_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.identity_trails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    phones JSONB DEFAULT '[]'::jsonb,
    fingerprints JSONB DEFAULT '[]'::jsonb,
    used_coupons JSONB DEFAULT '[]'::jsonb,
    is_trial_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_fingerprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT UNIQUE NOT NULL,
    device_id TEXT NOT NULL,
    free_trial_claimed BOOLEAN DEFAULT FALSE,
    session_count INTEGER DEFAULT 0,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL, -- 'percentage' or 'fixed'
    value DECIMAL NOT NULL,
    usage_limit INTEGER DEFAULT -1, -- -1 for unlimited
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================================================
-- 6. WHATSAPP ENGINE & LOGS (LIGHTWEIGHT CONSOLIDATED ARCHITECTURE)
-- =====================================================================================

-- Optimized: Stores only 2-3 total rows ('creds', 'session_keys', 'connection_lock')
CREATE TABLE IF NOT EXISTS public.whatsapp_auth (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.whatsapp_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.virtual_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    gmeet_link TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.session_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
    user_type TEXT NOT NULL, -- 'patient' | 'therapist'
    event_type TEXT DEFAULT 'join',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_id TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================================================
-- 7. CLINICAL & SUPPORT RECORDS
-- =====================================================================================

CREATE TABLE IF NOT EXISTS public.patient_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    therapist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    notes TEXT NOT NULL,
    reference_doctor TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    therapist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    details TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================================================
-- 8. BLOGS & CONTENT
-- =====================================================================================

CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content JSONB NOT NULL DEFAULT '[]'::jsonb,
    published BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- View ensuring backward compatibility for code referencing 'blog_posts'
CREATE OR REPLACE VIEW public.blog_posts AS SELECT * FROM public.blogs;

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    keys JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.offline_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    payload JSONB NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================================================
-- 9. PERFORMANCE INDEXES
-- =====================================================================================

CREATE INDEX IF NOT EXISTS idx_identity_phones ON public.identity_trails USING GIN (phones);
CREATE INDEX IF NOT EXISTS idx_identity_fingerprints ON public.identity_trails USING GIN (fingerprints);
CREATE INDEX IF NOT EXISTS idx_fingerprints_device ON public.user_fingerprints(device_id);
CREATE INDEX IF NOT EXISTS idx_booking_otps_phone ON public.booking_otps(phone_number, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_start_status ON public.appointments(start_time, status);
CREATE INDEX IF NOT EXISTS idx_appointments_guest_phone ON public.appointments(guest_phone);
CREATE INDEX IF NOT EXISTS idx_questionnaires_guest_phone ON public.pre_booking_questionnaires(guest_phone);
CREATE INDEX IF NOT EXISTS idx_questionnaires_status ON public.pre_booking_questionnaires(status);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs(slug);
CREATE INDEX IF NOT EXISTS idx_whatsapp_queue_sched ON public.whatsapp_queue(scheduled_time, status);

-- =====================================================================================
-- 10. STORAGE BUCKETS
-- =====================================================================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('therapist-assets', 'therapist-assets', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-content', 'blog-content', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_booking_questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identity_trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_queue ENABLE ROW LEVEL SECURITY;

-- USER ROLES Policies
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read all user roles" ON public.user_roles;
CREATE POLICY "Admins read all user roles" ON public.user_roles FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- THERAPIST PROFILES Policies
DROP POLICY IF EXISTS "Public profiles" ON public.therapist_profiles;
CREATE POLICY "Public profiles" ON public.therapist_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Therapists can insert own profile" ON public.therapist_profiles;
CREATE POLICY "Therapists can insert own profile" ON public.therapist_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Therapists can update own profile" ON public.therapist_profiles;
CREATE POLICY "Therapists can update own profile" ON public.therapist_profiles FOR UPDATE USING (auth.uid() = user_id);

-- THERAPIST AVAILABILITY Policies
DROP POLICY IF EXISTS "Public availability" ON public.therapist_availability;
CREATE POLICY "Public availability" ON public.therapist_availability FOR SELECT USING (true);

DROP POLICY IF EXISTS "Therapists manage availability" ON public.therapist_availability;
CREATE POLICY "Therapists manage availability" ON public.therapist_availability FOR ALL USING (auth.uid() = therapist_id);

-- APPOINTMENTS Policies
DROP POLICY IF EXISTS "Patients view own appointments" ON public.appointments;
CREATE POLICY "Patients view own appointments" ON public.appointments FOR SELECT USING (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Therapists view own appointments" ON public.appointments;
CREATE POLICY "Therapists view own appointments" ON public.appointments FOR SELECT USING (auth.uid() = therapist_id);

DROP POLICY IF EXISTS "Patients request appointments" ON public.appointments;
CREATE POLICY "Patients request appointments" ON public.appointments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Therapists update appointments" ON public.appointments;
CREATE POLICY "Therapists update appointments" ON public.appointments FOR UPDATE USING (auth.uid() = therapist_id);

-- PRE-BOOKING QUESTIONNAIRES Policies
DROP POLICY IF EXISTS "Public insert questionnaires" ON public.pre_booking_questionnaires;
CREATE POLICY "Public insert questionnaires" ON public.pre_booking_questionnaires FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read questionnaires" ON public.pre_booking_questionnaires;
CREATE POLICY "Public read questionnaires" ON public.pre_booking_questionnaires FOR SELECT USING (true);

DROP POLICY IF EXISTS "Super admins manage questionnaires" ON public.pre_booking_questionnaires;
CREATE POLICY "Super admins manage questionnaires" ON public.pre_booking_questionnaires FOR ALL USING (true);

-- COUPONS Policies
DROP POLICY IF EXISTS "Public Active Coupons" ON public.coupons;
CREATE POLICY "Public Active Coupons" ON public.coupons FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- CONTACT INQUIRIES Policies
DROP POLICY IF EXISTS "Anyone can insert inquiries" ON public.contact_inquiries;
CREATE POLICY "Anyone can insert inquiries" ON public.contact_inquiries FOR INSERT WITH CHECK (true);

-- BLOGS Policies
DROP POLICY IF EXISTS "Public can read published blogs" ON public.blogs;
CREATE POLICY "Public can read published blogs" ON public.blogs FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Authors or admins can read all blogs" ON public.blogs;
CREATE POLICY "Authors or admins can read all blogs" ON public.blogs FOR SELECT USING (
    auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
);

DROP POLICY IF EXISTS "Bloggers can insert blogs" ON public.blogs;
CREATE POLICY "Bloggers can insert blogs" ON public.blogs FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND (is_blogger = true OR role IN ('admin', 'super_admin')))
);

DROP POLICY IF EXISTS "Authors or admins can update blogs" ON public.blogs;
CREATE POLICY "Authors or admins can update blogs" ON public.blogs FOR UPDATE USING (
    auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
);

DROP POLICY IF EXISTS "Authors or admins can delete blogs" ON public.blogs;
CREATE POLICY "Authors or admins can delete blogs" ON public.blogs FOR DELETE USING (
    auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- PUSH & OFFLINE QUEUE Policies
DROP POLICY IF EXISTS "Users manage own subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users manage own subscriptions" ON public.push_subscriptions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own offline queue" ON public.offline_queue;
CREATE POLICY "Users manage own offline queue" ON public.offline_queue FOR ALL USING (auth.uid() = user_id);

-- STORAGE BUCKETS Policies
DROP POLICY IF EXISTS "Public Access therapist-assets" ON storage.objects;
CREATE POLICY "Public Access therapist-assets" ON storage.objects FOR SELECT USING (bucket_id = 'therapist-assets');

DROP POLICY IF EXISTS "Authenticated Upload therapist-assets" ON storage.objects;
CREATE POLICY "Authenticated Upload therapist-assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'therapist-assets');

DROP POLICY IF EXISTS "Public Access blog-content" ON storage.objects;
CREATE POLICY "Public Access blog-content" ON storage.objects FOR SELECT USING (bucket_id = 'blog-content');

DROP POLICY IF EXISTS "Authenticated Upload blog-content" ON storage.objects;
CREATE POLICY "Authenticated Upload blog-content" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-content');

-- =====================================================================================
-- 12. SEED DEFAULT DATA (THERAPIST PROFILES & VIRTUAL ROOMS)
-- =====================================================================================

-- Default Virtual Google Meet Rooms Pool
INSERT INTO public.virtual_rooms (name, gmeet_link, is_active)
VALUES 
  ('Room Alpha', 'https://meet.google.com/unh-eard-alp', true),
  ('Room Beta', 'https://meet.google.com/unh-eard-bet', true),
  ('Room Gamma', 'https://meet.google.com/unh-eard-gam', true)
ON CONFLICT (gmeet_link) DO NOTHING;

-- Default Active Discount Coupons
INSERT INTO public.coupons (code, discount_type, value, usage_limit, is_active)
VALUES
  ('UNHEARD10', 'percentage', 10, -1, true),
  ('WELCOME100', 'fixed', 100, -1, true)
ON CONFLICT (code) DO NOTHING;

