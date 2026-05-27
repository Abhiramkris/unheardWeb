import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const jwtSecret = process.env.SUPABASE_JWT_SECRET;

if (!supabaseUrl || !anonKey || !jwtSecret) {
  console.error('Missing env vars');
  process.exit(1);
}

// Generate JWT for therapist user ID
const therapistUserId = '7e52da92-a36b-4813-ae82-80fccdaea64d';
const payload = {
  aud: 'authenticated',
  exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
  sub: therapistUserId,
  email: 'lekshmipriya@unheard.co.in', // dummy or actual email
  role: 'authenticated',
  app_metadata: {
    provider: 'email',
    providers: ['email']
  },
  user_metadata: {},
  role_claims: ['authenticated']
};

const token = jwt.sign(payload, jwtSecret);

const supabase = createClient(supabaseUrl, anonKey, {
  global: {
    headers: {
      Authorization: `Bearer ${token}`
    }
  },
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function testRLS() {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      pre_booking_questionnaires(answers)
    `)
    .order('start_time', { ascending: false });

  if (error) {
    console.error('RLS Query Error:', error);
  } else {
    console.log(`RLS Query Succeeded! Total fetched: ${data?.length}`);
    console.log('Fetched Appointments:', JSON.stringify(data, null, 2));
  }
}

testRLS();
