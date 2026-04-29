import { createAdminClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function RoomGateway({ params, searchParams }: { params: { id: string }, searchParams: { type?: string } }) {
  const adminSupabase = await createAdminClient();

  const { data: appointment, error } = await adminSupabase
    .from('appointments')
    .select('start_time, status, meeting_link, joined_at_patient, joined_at_therapist')
    .eq('id', params.id)
    .single();

  if (error || !appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEFEFC] font-georgia text-center p-8">
        <div>
           <h1 className="text-3xl font-bold text-red-600 mb-2">Invalid Session Link 🛑</h1>
           <p className="text-gray-600 font-nunito">The meeting room you are trying to access does not exist.</p>
        </div>
      </div>
    );
  }

  if (appointment.status !== 'confirmed' && appointment.status !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEFEFC] font-georgia text-center p-8">
        <div className="max-w-md">
           <h1 className="text-3xl font-bold text-yellow-600 mb-4">Pending Confirmation ⏳</h1>
           <p className="text-gray-600 font-nunito leading-relaxed">
             The session has not yet been confirmed by our admins. Check your WhatsApp for updates!
           </p>
        </div>
      </div>
    );
  }

  const start = new Date(appointment.start_time).getTime();
  const now = new Date().getTime();
  const diffHours = (now - start) / (1000 * 60 * 60);

  if (diffHours < -0.5) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEFEFC] font-georgia text-center p-8">
         <div className="max-w-md">
           <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
           </div>
           <h1 className="text-3xl font-bold text-gray-900 mb-4">You're a bit early!</h1>
           <p className="text-gray-600 font-nunito leading-relaxed">
             This session has not started yet.<br/>The secure meeting room will unlock <strong>30 minutes</strong> before your scheduled time.
           </p>
         </div>
      </div>
    );
  }

  if (diffHours > 6) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEFEFC] font-georgia text-center p-8">
        <div className="max-w-md">
           <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
           </div>
           <h1 className="text-3xl font-bold text-gray-900 mb-4">Session Expired</h1>
           <p className="text-gray-600 font-nunito leading-relaxed">
             This session link has securely expired. UnHeard meeting links are strictly valid for only <strong>6 hours</strong> after the scheduled start time to protect your privacy and ensure exclusivity.
           </p>
        </div>
      </div>
    );
  }

  // LOG JOIN EVENT
  const userType = searchParams.type;
  if (userType === 'patient' || userType === 'therapist') {
    // 1. Create a detailed audit log entry
    await adminSupabase.from('session_logs').insert([{
        appointment_id: params.id,
        user_type: userType,
        event_type: 'join'
    }]);

    // 2. Also update the convenience columns on appointments for quick dashboard UI
    const updateColumn = userType === 'patient' ? 'joined_at_patient' : 'joined_at_therapist';
    
    if (!appointment[updateColumn]) {
        await adminSupabase
          .from('appointments')
          .update({ [updateColumn]: new Date().toISOString() })
          .eq('id', params.id);
    }
  }

  // If valid, boot directly to the secure virtual space.
  redirect(appointment.meeting_link || `https://meet.jit.si/unHeard-Session-${params.id.substring(0,8)}`);
}
