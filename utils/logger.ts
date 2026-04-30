import { createAdminClient } from '@/utils/supabase/server';

export type LogAction = 
  | 'login' 
  | 'logout'
  | 'profile_change' 
  | 'meeting_join' 
  | 'meeting_leave' 
  | 'add_blog' 
  | 'edit_blog'
  | 'delete_blog'
  | 'add_coupon' 
  | 'delete_coupon'
  | 'assign_appointment'
  | 'system_sync';

export async function logAdminActivity(
  adminId: string, 
  action: LogAction, 
  targetId?: string, 
  details?: any
) {
  try {
    const supabase = await createAdminClient();
    await supabase.from('admin_activity_logs').insert({
      admin_id: adminId,
      action,
      target_id: targetId,
      details
    });
  } catch (error) {
    console.error('Failed to record admin log:', error);
  }
}
