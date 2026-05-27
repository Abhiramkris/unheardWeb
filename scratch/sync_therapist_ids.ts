import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncTherapistIds() {
  const incorrectId = '7e52da92-a36b-4813-ae82-80fccdaea64d';
  const correctId = '1643fd5d-4db5-4cfc-8468-520d67404d5f'; // Super Admin account

  console.log(`Step 1: Updating therapist_profiles user_id from ${incorrectId} to ${correctId}`);
  const { data: profileUpdate, error: pError } = await supabase
    .from('therapist_profiles')
    .update({ user_id: correctId })
    .eq('user_id', incorrectId)
    .select();

  if (pError) {
    console.error('Error updating therapist profile:', pError);
  } else {
    console.log('Profile updated successfully:', profileUpdate);
  }

  console.log(`Step 2: Updating appointments therapist_id from ${incorrectId} to ${correctId}`);
  const { data: appointmentsUpdate, error: aError } = await supabase
    .from('appointments')
    .update({ therapist_id: correctId })
    .eq('therapist_id', incorrectId)
    .select();

  if (aError) {
    console.error('Error updating appointments:', aError);
  } else {
    console.log('Appointments updated successfully:', appointmentsUpdate);
  }
}

syncTherapistIds();
