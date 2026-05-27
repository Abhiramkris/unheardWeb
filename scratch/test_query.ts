import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listUserRoles() {
  const { data: roles, error } = await supabase
    .from('user_roles')
    .select('*');

  if (error) {
    console.error('Error fetching user roles:', error);
  } else {
    console.log('All configured user roles:', JSON.stringify(roles, null, 2));
  }
}

listUserRoles();
