-- 1. Ensure Row Level Security (RLS) is active on public.appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 2. Ensure RLS is active on public.user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Verify/Recreate SELECT policy for appointments (Therapists view only their assigned sessions)
DROP POLICY IF EXISTS "Therapists view own appointments" ON public.appointments;
CREATE POLICY "Therapists view own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = therapist_id);

-- 4. Verify/Recreate UPDATE policy for appointments (Therapists update only their assigned sessions)
DROP POLICY IF EXISTS "Therapists update appointments" ON public.appointments;
CREATE POLICY "Therapists update appointments" ON public.appointments
  FOR UPDATE USING (auth.uid() = therapist_id);

-- 5. Verify/Recreate Admin view all override policy for SELECT and ALL actions
DROP POLICY IF EXISTS "Admin view all appointments" ON public.appointments;
CREATE POLICY "Admin view all appointments" ON public.appointments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

-- 6. Ensure users can read only their own role
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- 7. Ensure admins can read all roles
DROP POLICY IF EXISTS "Admins read all user roles" ON public.user_roles;
CREATE POLICY "Admins read all user roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );
