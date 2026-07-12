/**
 * app/therapists/[id]/layout.tsx
 * Dynamic server layout — fetches therapist data server-side and injects
 * rich metadata + Person/BreadcrumbList JSON-LD for each therapist profile.
 */
import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { buildTherapistMetadata, buildTherapistSchema } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

interface LayoutProps {
  children:  React.ReactNode;
  params:    Promise<{ id: string }>;
}

async function getTherapist(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data } = await supabase
    .from('therapist_profiles')
    .select('user_id, full_name, bio, qualification, specialties, avatar_url')
    .eq('user_id', id)
    .single();

  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const therapist = await getTherapist(id);

  if (!therapist) {
    return { title: 'Therapist Profile | unHeard', robots: { index: false, follow: false } };
  }

  return buildTherapistMetadata({
    id,
    name:       therapist.full_name,
    bio:        therapist.bio ?? '',
    specialty:  therapist.specialties?.[0],
    avatarUrl:  therapist.avatar_url,
  });
}

export default async function TherapistProfileLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  const therapist = await getTherapist(id);

  const schema = therapist
    ? buildTherapistSchema({
        id,
        name:          therapist.full_name,
        bio:           therapist.bio ?? '',
        specialty:     therapist.specialties?.[0],
        avatarUrl:     therapist.avatar_url,
        qualification: therapist.qualification,
      })
    : [];

  return (
    <>
      {schema.length > 0 && <JsonLd data={schema} />}
      {children}
    </>
  );
}
