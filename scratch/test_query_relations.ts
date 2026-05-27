import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRelations() {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      guest_name,
      pre_booking_questionnaires(answers)
    `)
    .limit(5);

  if (error) {
    console.error('Query Error:', error);
  } else {
    console.log('Query Succeeded! Data:', JSON.stringify(data, null, 2));
  }
}

testRelations();
