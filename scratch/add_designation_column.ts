import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('Attempting to add designation column to therapist_profiles via exec_sql RPC...');
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: "ALTER TABLE public.therapist_profiles ADD COLUMN IF NOT EXISTS designation TEXT DEFAULT 'clinical';"
  });

  if (error) {
    console.error('RPC exec_sql failed:', error.message);
    console.log('\nIf the RPC is not defined, please run this in the Supabase SQL editor:');
    console.log("ALTER TABLE public.therapist_profiles ADD COLUMN IF NOT EXISTS designation TEXT DEFAULT 'clinical';\n");
  } else {
    console.log('Column added successfully via RPC!', data);
  }
}

runMigration();
