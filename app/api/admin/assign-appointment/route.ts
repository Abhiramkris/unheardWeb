import { createAdminClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { WhatsAppManager } from '@/lib/whatsapp/WhatsAppClient';

export async function POST(req: Request) {
  try {
    const { appointment_id, therapist_id, meeting_link } = await req.json();

    if (!appointment_id || !therapist_id) {
      return NextResponse.json({ success: false, error: 'Appointment ID and Therapist ID are required' }, { status: 400 });
    }

    const adminSupabase = await createAdminClient();

    // 1. Get the appointment details
    const { data: appointment, error: aptError } = await adminSupabase
      .from('appointments')
      .select('*, pre_booking_questionnaires(answers)')
      .eq('id', appointment_id)
      .single();

    if (aptError || !appointment) {
      return NextResponse.json({ success: false, error: 'Appointment not found' }, { status: 404 });
    }

    // 2. Perform Virtual Room Allocation if link not manually provided
    let final_meeting_link = meeting_link;

    if (!final_meeting_link) {
      const startIso = new Date(appointment.start_time).toISOString();
      // Assume 1 hour default duration constraint for locking
      const endIso = new Date(new Date(appointment.start_time).getTime() + 60 * 60 * 1000).toISOString();

      // Find overlapping appointments directly conflicting with this hour block
      const { data: overlaps } = await adminSupabase
        .from('appointments')
        .select('meeting_link')
        .neq('id', appointment_id)
        .in('status', ['confirmed', 'approved'])
        .not('meeting_link', 'is', null)
        .gte('start_time', startIso)
        .lte('start_time', endIso);

      const busyLinks = (overlaps || []).map(o => o.meeting_link).filter(link => link.includes('google'));

      // Find an active virtual room NOT in busyLinks
      const { data: activeRooms } = await adminSupabase
        .from('virtual_rooms')
        .select('gmeet_link')
        .eq('is_active', true);

      const availableRoom = activeRooms?.find(room => !busyLinks.includes(room.gmeet_link));

      if (availableRoom) {
        final_meeting_link = availableRoom.gmeet_link;
      } else {
        return NextResponse.json({ 
          success: false, 
          error: 'All Virtual Google Meet rooms are currently occupied for this exact time slot. Please paste a manual Meet Link to assign.' 
        }, { status: 400 });
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://unheard.co.in';
    const gateway_link = `${baseUrl}/room/${appointment_id}`;

    // 3. Assign the therapist and update the assignment status
    const { error: updateError } = await adminSupabase
      .from('appointments')
      .update({
        therapist_id: therapist_id,
        assignment_status: 'assigned',
        status: 'confirmed',
        meeting_link: final_meeting_link
      })
      .eq('id', appointment_id);

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // 3. Fetch Therapist info to dispatch WhatsApp
    const { data: therapistProfile } = await adminSupabase
      .from('therapist_profiles')
      .select('full_name, phone, qualification')
      .eq('user_id', therapist_id)
      .maybeSingle();

    const start = new Date(appointment.start_time);
    
    const formattedDate = start.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const formattedTime = start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const qData = appointment.pre_booking_questionnaires?.[0]?.answers || {};
    const guestInfo = qData.guest_info || {};
    
    // Robust Phone & Name Detection
    let patientPhone = appointment.guest_phone || guestInfo.phone || null;
    let patientName = appointment.guest_name || guestInfo.name || 'Anonymous User';

    // FALLBACK: If phone still missing, try fetching from patient profile if it exists
    if (!patientPhone && appointment.patient_id) {
       const { data: pProfile } = await adminSupabase
         .from('patient_profiles')
         .select('phone, full_name')
         .eq('user_id', appointment.patient_id)
         .maybeSingle();
       
       if (pProfile) {
         patientPhone = pProfile.phone;
         patientName = pProfile.full_name || patientName;
       }
    }

    console.log('ASSIGNMENT DEBUG [EXTENDED]:', { 
        patientPhone, 
        patientName, 
        therapistPhone: therapistProfile?.phone,
        therapistFound: !!therapistProfile,
        apptId: appointment.id 
    });

    // 4. Send WhatsApp to Therapist
    if (therapistProfile?.phone) {
      const tGatewayLink = `${gateway_link}?type=therapist`;
      const therapistMsg = `*New Appointment Assigned!* ✅\n\nDr. ${therapistProfile.full_name}, an admin has assigned a new session to you.\n\n*Patient:* ${patientName}\n*Date:* ${formattedDate}\n*Time:* ${formattedTime}\n*Type:* ${qData.type || 'Individual'} (${qData.service || 'General'})\n\n🔗 *Join Session Room:* ${tGatewayLink}\n\nPlease check your dashboard for details.`;
      const tRes = await WhatsAppManager.sendMessage(therapistProfile.phone, therapistMsg);
      console.log('Therapist WhatsApp Result:', tRes);
    }
    // 5. Send WhatsApp to Patient
    if (patientPhone) {
      const therapistName = therapistProfile?.full_name || 'your assigned therapist';
      const therapistQual = therapistProfile?.qualification ? `\n*Specialization:* ${therapistProfile.qualification}` : '';
      
      let msgAction = `🔒 *Meeting Access:* A secure Google Meet link will be generated and shared with you strictly *6 hours* before your session starts.`;
      
      // DEV MODE OVERRIDE: Send link immediately for testing
      if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost')) {
        msgAction = `🔗 *Test Link (Dev Mode):* ${gateway_link}\n\nNote: In production, this link is only shared 6 hours before.`;
      }

      const patientMsg = `*Therapist Assigned & Confirmed!* 🎉\n\nHi ${patientName}, great news! Your session has been officially confirmed.\n\nYou have been matched with *Dr. ${therapistName}* who is highly experienced and specifically trained for your needs.${therapistQual}\n\n🗓️ *Date:* ${formattedDate}\n⏰ *Time:* ${formattedTime}\n\n${msgAction}\n\nSee you soon!`;
      
      const pRes = await WhatsAppManager.sendMessage(patientPhone, patientMsg);
      console.log('Patient WhatsApp Result:', pRes);

      // DEV MODE ONLY: Also send the 15-minute reminder copy immediately for verification
      if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost')) {
         const pGatewayLink = `${gateway_link}?type=patient`;
         const reminderMsg = `*Your Session is Starting Soon!* ⏳ (Dev Test)\n\nHi ${patientName}, your session is starting in *15 minutes*.\n\n🔗 *Join Now:* ${pGatewayLink}\n\nPlease join 2 minutes early to test your audio and video.`;
         await WhatsAppManager.sendMessage(patientPhone, reminderMsg);
         console.log('Dev Mode 15m Reminder Simulated');
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Assign Therapist Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
