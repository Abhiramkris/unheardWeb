import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createAdminClient } from '../lib/supabase/admin';

async function checkQueue() {
  const supabase = await createAdminClient();
  const { data: all, error } = await supabase
    .from('whatsapp_queue')
    .select('*');

  if (error) {
    console.error('Error fetching queue:', error);
    return;
  }

  console.log(`Total messages in whatsapp_queue: ${all?.length || 0}`);
  const statusCounts = all?.reduce((acc: any, msg: any) => {
    acc[msg.status] = (acc[msg.status] || 0) + 1;
    return acc;
  }, {});
  console.log('Status Counts:', statusCounts);
  
  if (all && all.length > 0) {
    console.log('Last 3 messages:', all.slice(-3));
  }
}

checkQueue();
