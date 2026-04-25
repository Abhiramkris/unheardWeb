
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://your-project.supabase.co"; // This will be replaced by env
const SUPABASE_KEY = "your-key"; // This will be replaced by env

async function check() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('Missing ENV vars');
    return;
  }

  const supabase = createClient(url, key);

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching appointments:', error);
  } else {
    console.log('Columns in appointments:', Object.keys(data[0] || {}));
  }
}

check();
