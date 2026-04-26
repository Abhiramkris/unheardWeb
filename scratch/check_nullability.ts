
import { createClient } from '@supabase/supabase-js';

async function check() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  const supabase = createClient(url, key);

  console.log('Checking appointments column details...');
  // Querying information_schema requires service role or superuser
  // But we can just try to insert a null patient_id and see the error
  const { error } = await supabase.from('appointments').insert({
    therapist_id: "3f57e30a-4250-4907-b0a1-f789d0e55567",
    start_time: new Date().toISOString(),
    end_time: new Date().toISOString(),
    status: 'pending',
    patient_id: null
  });

  if (error) {
    console.log('Error Details:', JSON.stringify(error, null, 2));
  } else {
    console.log('Insert with NULL patient_id Succeeded!');
  }
}
check();
