import { createAdminClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { WhatsAppManager } from '@/lib/whatsapp/WhatsAppClient';

// This API should be called periodically by Vercel Cron (e.g. every 5 minutes)
// Keep in mind to secure it with a cron secret in production
export async function GET(req: Request) {
  try {
    // Basic auth guard for CRON secret if deployed
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized Cron Request' }, { status: 401 });
    }

    const adminSupabase = await createAdminClient();
    const now = new Date();

    // Look for upcoming appointments that haven't passed yet, up to 7 hours ahead to cover 6 hour reminders
    const timeWindowStart = now.toISOString();
    const timeWindow6HoursMax = new Date(now.getTime() + (6.5 * 60 * 60 * 1000)).toISOString();

    const { data: upcomingAppointments, error } = await adminSupabase
      .from('appointments')
      .select('*, pre_booking_questionnaires(answers), therapist:therapist_id(id)')
      .gte('start_time', timeWindowStart)
      .lte('start_time', timeWindow6HoursMax)
      .in('status', ['confirmed', 'approved']); // Only run for confirmed appointments

    if (error || !upcomingAppointments) {
      console.error('Failed to fetch upcoming appointments:', error);
      return NextResponse.json({ success: false, error: 'Failed fetching appointments' }, { status: 500 });
    }

    let dispatchedCount = 0;

    for (const appt of upcomingAppointments) {
      const startTime = new Date(appt.start_time).getTime();
      const differenceMs = startTime - now.getTime();
      const diffHours = differenceMs / (1000 * 60 * 60);
      const diffMinutes = differenceMs / (1000 * 60);

      const qData = appt.pre_booking_questionnaires?.[0]?.answers || {};
      const guestInfo = qData.guest_info || {};
      const patientPhone = guestInfo.phone;
      const patientName = guestInfo.name || 'there';

      // ==========================================
      // 1. PATIENT: 6 HOURS BEFORE - LINK DELIVERY
      // ==========================================
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://unheard.co.in';
      const gatewayLink = `${baseUrl}/room/${appt.id}`;

      if (diffHours <= 6 && diffHours > 1 && !appt.reminded_6h_patient && patientPhone) {
        const pGatewayLink = `${gatewayLink}?type=patient`;
        const msg = `*Your Secure Meeting Link* 🔒\n\nHi ${patientName}, your session is scheduled for today.\n\n🔗 *Join Room:* ${pGatewayLink}\n\nThis link will become active 30 minutes before your session. See you soon!`;
        
        await WhatsAppManager.sendMessage(patientPhone, msg);
        await adminSupabase.from('appointments').update({ reminded_6h_patient: true }).eq('id', appt.id);
        dispatchedCount++;
      }

      // ==========================================
      // 2. PATIENT: 15 MINUTES BEFORE NOTIFICATION
      // ==========================================
      if (diffMinutes <= 15 && diffMinutes > 0 && !appt.reminded_15m_patient && patientPhone) {
        const pGatewayLink = `${gatewayLink}?type=patient`;
        const msg = `*Your Session is Starting Soon!* ⏳\n\nHi ${patientName}, your session is starting in *15 minutes*.\n\n🔗 *Join Now:* ${pGatewayLink}\n\nPlease join 2 minutes early to test your audio and video.`;
        
        await WhatsAppManager.sendMessage(patientPhone, msg);
        await adminSupabase.from('appointments').update({ reminded_15m_patient: true }).eq('id', appt.id);
        dispatchedCount++;
      }

      // ==========================================
      // 3. THERAPIST: 15 MINUTES BEFORE NOTIFICATION
      // ==========================================
      if (diffMinutes <= 15 && diffMinutes > 0 && !appt.reminded_15m_therapist && appt.therapist_id) {
        // Fetch therapist profile for phone
        const { data: tProfile } = await adminSupabase
          .from('therapist_profiles')
          .select('full_name, phone')
          .eq('user_id', appt.therapist_id)
          .single();

        if (tProfile?.phone) {
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://unheard.co.in';
          const tGatewayLink = `${baseUrl}/room/${appt.id}?type=therapist`;
          const msg = `*Session Starting Soon!* ⏳\n\nDr. ${tProfile.full_name}, your session with *${patientName}* begins in *15 minutes*.\n\n🔗 *Join Space:* ${tGatewayLink}\n\nPlease be ready.`;
          
          await WhatsAppManager.sendMessage(tProfile.phone, msg);
          
          // Mark as sent
          await adminSupabase.from('appointments').update({ reminded_15m_therapist: true }).eq('id', appt.id);
          dispatchedCount++;
        }
      }
    }

    return NextResponse.json({ success: true, processed: upcomingAppointments.length, dispatched: dispatchedCount });
  } catch (error: any) {
    console.error('CRON Notification Dispacth Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
