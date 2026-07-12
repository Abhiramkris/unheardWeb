import { createClient, createAdminClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { NotificationController } from '@/lib/notifications/NotificationController';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', currentUser.id)
      .single();

    const userRole = roleData?.role;
    if (!userRole || !['therapist', 'admin', 'super_admin'].includes(userRole)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { appointment_id, summary } = await req.json();

    if (!appointment_id) {
      return NextResponse.json({ success: false, error: 'Appointment ID is required' }, { status: 400 });
    }

    const adminSupabase = await createAdminClient();

    // If the user is a therapist, verify they are assigned to this appointment
    if (userRole === 'therapist') {
      const { data: aptCheck } = await adminSupabase
        .from('appointments')
        .select('therapist_id')
        .eq('id', appointment_id)
        .maybeSingle();

      if (!aptCheck || aptCheck.therapist_id !== currentUser.id) {
        return NextResponse.json({ success: false, error: 'Forbidden: You are not assigned to this appointment' }, { status: 403 });
      }
    }

    // 1. Update the appointment status and record completion
    const { error: updateError } = await adminSupabase
      .from('appointments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        session_summary: summary || 'No summary provided.'
      })
      .eq('id', appointment_id);

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // 2. CLEANUP: Delete entry from pre_booking_questionnaires as requested
    const { error: cleanupError } = await adminSupabase
      .from('pre_booking_questionnaires')
      .delete()
      .eq('appointment_id', appointment_id);

    if (cleanupError) {
       console.error('Cleanup error (non-fatal):', cleanupError);
    }
    
    // 3. Dispatch Notifications
    const { data: apt } = await adminSupabase
      .from('appointments')
      .select('guest_name, guest_email, guest_phone')
      .eq('id', appointment_id)
      .single();

    if (apt?.guest_email && apt?.guest_phone) {
      await NotificationController.notifySessionSummary({
        email: apt.guest_email,
        phone: apt.guest_phone,
        name: apt.guest_name || 'Anonymous',
        summary: summary || 'No summary provided.'
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Close Session Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
