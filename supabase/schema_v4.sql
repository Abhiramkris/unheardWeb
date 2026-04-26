
-- =====================================================================================
-- UNHEARD SCHEMA UPDATES V4 - AUTH & ANTI-EXPLOIT
-- =====================================================================================

-- 19. DEVICE FINGERPRINTING & SESSION TRACKING
-- Track device IDs to prevent multiple free trial claims
ALTER TABLE public.therapist_profiles ADD COLUMN IF NOT EXISTS device_id TEXT;
-- Actually, we should add device_id to the patient/user profiles or a separate tracking table
CREATE TABLE IF NOT EXISTS public.user_fingerprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT UNIQUE NOT NULL,
    device_id TEXT NOT NULL,
    free_trial_claimed BOOLEAN DEFAULT FALSE,
    session_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_fingerprints_device ON public.user_fingerprints(device_id);

-- 20. COUPON MANAGEMENT
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

-- 21. APPOINTMENT STATUS ENHANCEMENT
-- Adding status enum or text support for tracking
-- Status flow: registered -> booked -> allotted -> [active/completed]
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS assignment_status TEXT DEFAULT 'pending'; -- pending, allotted
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS registration_status TEXT DEFAULT 'new'; -- new, returning

-- 22. MANUAL ALLOTMENT SUPPORT
-- Make therapist_id optional for initial booking
ALTER TABLE public.appointments ALTER COLUMN therapist_id DROP NOT NULL;
