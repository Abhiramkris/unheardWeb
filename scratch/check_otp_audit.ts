
import { createClient } from '@supabase/supabase-js';

async function check() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  const supabase = createClient(url, key);

  const phone = "8848656908";
  const { data, error } = await supabase
    .from('booking_otps')
    .select('*')
    .eq('phone_number', phone)
    .order('created_at', { ascending: false });
  
  if (error) console.error(error);
  else console.log('OTP Records for', phone, ':', data);
}
check();
