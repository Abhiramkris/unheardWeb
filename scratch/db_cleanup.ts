import { createAdminClient } from '../utils/supabase/server';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function cleanup() {
  const supabase = await createAdminClient();
  console.log('🚀 Starting Database Cleanup...');

  // 1. Clear all booking OTPs
  const { error: otpError } = await supabase.from('booking_otps').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (otpError) console.error('Error clearing OTPs:', otpError);
  else console.log('✅ Cleared all booking OTPs.');

  // 2. Clear all Questionnaires
  const { error: qError } = await supabase.from('pre_booking_questionnaires').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (qError) console.error('Error clearing questionnaires:', qError);
  else console.log('✅ Cleared all pre-booking questionnaires.');

  // 3. Clear all Appointments
  const { error: aError } = await supabase.from('appointments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (aError) console.error('Error clearing appointments:', aError);
  else console.log('✅ Cleared all appointments.');

  // 4. Cleanup WhatsApp Auth (Keep only 'creds' to stay logged in)
  const { error: authError } = await supabase
    .from('whatsapp_auth')
    .delete()
    .neq('id', 'creds');
  if (authError) console.error('Error cleaning WhatsApp auth:', authError);
  else console.log('✅ Purged bloated WhatsApp session data (retained credentials).');

  console.log('✨ Cleanup Complete!');
}

cleanup();
