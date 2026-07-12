'use server';

import { createAdminClient, createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { WhatsAppManager } from './whatsapp/WhatsAppClient';
import { IdentityManager } from './identity/IdentityManager';
import { headers } from 'next/headers';
import { resend } from './resend';

/**
 * REQUESTS A NEW SESSION (Client-side trigger)
 */
export async function requestSession(data: {
  start_time: string;
  is_trial: boolean;
  phone: string;
  deviceId?: string;
  questionnaire: any;
  patient_details?: {
    name: string;
    email: string;
  };
  therapist_id?: string;
}) {
  try {
    const adminSupabase = await createAdminClient();
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || '0.0.0.0';

    // 1. VALIDATE PHONE
    const cleanPhone = data.phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return { success: false, error: 'Invalid phone number format.' }
    }

    // 2. IDENTITY & ANTI-EXPLOIT
    const identity = await IdentityManager.resolveIdentity(cleanPhone, data.deviceId);

    if (data.is_trial) {
      if (identity && identity.is_trial_claimed) {
        return { success: false, error: 'You have already availed a free introductory session. Please choose a standard plan.' }
      }
    }

    // 3. CHECK CONFLICTS (Optional for pending)
    const start = new Date(data.start_time);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    if (data.therapist_id) {
      const { data: existing } = await adminSupabase
        .from('appointments')
        .select('id')
        .eq('therapist_id', data.therapist_id)
        .neq('status', 'cancelled')
        .lt('start_time', end.toISOString())
        .gt('end_time', start.toISOString())
        .maybeSingle()

      if (existing && !(process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost'))) {
        return { success: false, error: 'This time slot has already been booked. Please select another time.' }
      }
    }

    // 4. CREATE PENDING QUESTIONNAIRE (Primary Entry Point)
    let pricing: { trial: number; single: number; standard: number; premium: number } = {
      trial: 399,
      single: 999,
      standard: 2999,
      premium: 1999
    };
    if (data.therapist_id) {
      const { data: profile } = await adminSupabase
        .from('therapist_profiles')
        .select('pricing')
        .eq('user_id', data.therapist_id)
        .maybeSingle();
      if (profile?.pricing && typeof profile.pricing === 'object') {
        pricing = { ...pricing, ...(profile.pricing as any) };
      }
    }

    let amount = 999;
    const planType = data.questionnaire?.plan_type || '';
    if (data.is_trial) {
      amount = 0;
    } else if (planType === 'Single Session') {
      amount = pricing.single;
    } else if (planType === 'Standard Pack') {
      amount = pricing.standard;
    } else if (planType === 'Premium Pack') {
      amount = pricing.premium;
    } else {
      amount = pricing.single;
    }

    const questionnairePayload: any = {
      patient_id: identity?.user_id || null,
      guest_name: data.patient_details?.name || 'Guest',
      guest_phone: cleanPhone,
      guest_email: data.patient_details?.email || '',
      requested_start_time: start.toISOString(),
      is_trial: data.is_trial,
      status: 'pending',
      payment_status: data.is_trial ? 'completed' : 'pending',
      amount: amount,
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      transaction_id: `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      answers: {
        ...data.questionnaire,
        ip_address: ip
      }
    }

    const { data: questionnaire, error: qError } = await adminSupabase
      .from('pre_booking_questionnaires')
      .insert([questionnairePayload])
      .select()
      .single()

      if (qError) {
        console.error('DATABASE ERROR [questionnaire]:', qError)
        return { success: false, error: 'Database error: Could not save session request.' }
      }

    // If payment is required, return early and let client handle payment gateway
    if (!data.is_trial) {
      return { 
        success: true, 
        questionnaireId: questionnaire.id, 
        transactionId: questionnaire.transaction_id,
        requiresPayment: true,
        amount: amount 
      };
    }

    // Finalize for Free Trial
    await finalizeBooking(questionnaire.id);

    // 7. RECORD IDENTITY UPDATE & COUPON CLAIM
    if (identity) {
      await IdentityManager.claimCoupon(identity.id, data.is_trial ? 'FREE_TRIAL' : 'STANDARD', data.is_trial);
    }

    revalidatePath('/super-admin')
    return { success: true, questionnaireId: questionnaire.id }
  } catch (error: any) {
      console.error('CRITICAL SESSION REQUEST ERROR:', error)
      return { success: false, error: error.message || 'An unexpected internal error occurred.' }
    }
}

/**
 * FINALIZES BOOKING (Notifications, Admin Alerts, Identity Update)
 * Called after successful payment or for free trials.
 */
export async function finalizeBooking(questionnaireId: string) {
  try {
    const adminSupabase = await createAdminClient();
    const { data: q, error } = await adminSupabase
      .from('pre_booking_questionnaires')
      .select('*')
      .eq('id', questionnaireId)
      .single();

    if (error || !q) throw new Error('Questionnaire not found');

    const start = new Date(q.requested_start_time);
    const formattedDate = start.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const formattedTime = start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // A. Notify Patient
    if (q.guest_phone) {
      const patientMsg = `*Registration Under Review!* 🧘‍♀️\n\nHi ${q.guest_name}, we have successfully received your session request for *${formattedDate}* at *${formattedTime}*.\n\nYour problems are being carefully assessed by a real human expert to ensure you get the most appropriate care. We are currently matching you and assigning the best therapist for your specific needs.\n\nYou will receive an update confirming your assigned therapist within *30 mins*.\n\nFor any issues, please contact +919606083755.\n\nThanks, and take care!`;
      await WhatsAppManager.enqueueMessage(q.guest_phone, patientMsg);
    }

    // B. Notify Super Admin
    const { data: superAdmins } = await adminSupabase.from('user_roles').select('phone_number').eq('role', 'super_admin');
    if (superAdmins && superAdmins.length > 0) {
      const adminMsg = `*New Session Request!* 🚨\n\n*${q.guest_name}* (${q.guest_phone}) has just submitted a new session request for ${formattedDate} at ${formattedTime}.\n\nPlease check the admin dashboard to review and assign a therapist.`;
      for (const admin of superAdmins) {
        if (admin.phone_number) {
          await WhatsAppManager.enqueueMessage(admin.phone_number, adminMsg);
        }
      }
    }

    // Trigger processing immediately (on-server)
    await WhatsAppManager.processQueue();

    revalidatePath('/super-admin');
    return { success: true };
  } catch (err) {
    console.error('Finalize Booking Error:', err);
    return { success: false };
  }
}

export async function reportClientError(errorMessage: string, context: string) {
  try {
    const adminSupabase = await createAdminClient();
    const { data: superAdmins } = await adminSupabase.from('user_roles').select('phone_number').eq('role', 'super_admin');
    
    if (superAdmins && superAdmins.length > 0) {
      const adminMsg = `*Critical Client Error!* 🚨\n\n*Context:* ${context}\n*Error:* ${errorMessage}\n\nPlease check the logs or debug the client flow.`;
      
      for (const admin of superAdmins) {
        if (admin.phone_number) {
          await WhatsAppManager.enqueueMessage(admin.phone_number, adminMsg);
        }
      }
      await WhatsAppManager.processQueue();
    }
    return { success: true };
  } catch (err) {
    console.error('Failed to report client error:', err);
    return { success: false };
  }
}

/**
 * THERAPIST ONBOARDING & PROFILE
 */
export async function updateTherapistProfile(formData: {
  full_name: string;
  bio: string;
  qualification: string;
  specialties: string[];
  avatar_url?: string;
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('therapist_profiles')
    .upsert({
      user_id: user.id,
      ...formData
    })

  if (error) throw error
  revalidatePath('/admin/dashboard')
}

/**
 * ADMIN DIRECT PROFILE UPDATE (Bypasses therapist-only update RLS)
 */
export async function adminUpdateTherapistProfile(
  targetUserId: string,
  profileData: {
    full_name?: string;
    bio?: string;
    qualification?: string;
    microtag?: string;
    tagline?: string;
    avatar_url?: string;
    approach?: string;
    good_fit_for?: string[];
    display_hours?: string;
    phone?: string;
    note?: string;
    specialties?: string[];
    is_available?: boolean;
    qualification_desc?: string;
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify admin permissions
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleError || !roleData || !['admin', 'super_admin'].includes(roleData.role)) {
    throw new Error('Forbidden: Only administrators can modify other profiles.')
  }

  const adminSupabase = await createAdminClient()
  const { error } = await adminSupabase
    .from('therapist_profiles')
    .update(profileData)
    .eq('user_id', targetUserId)

  if (error) throw error
  revalidatePath('/super-admin')
  revalidatePath('/therapists')
}


/**
 * CONTACT US HANDLING
 */
export async function submitContactInquiry(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const supabase = await createClient()

  // 1. Save to DB
  const { error } = await supabase
    .from('contact_inquiries')
    .insert([data])

  if (error) throw error

  // 2. Notify via Email using Resend
  await resend.emails.send({
    from: 'Unheard <notifications@unheard.care>',
    to: ['support@unheard.care'], // Company email
    subject: `New Inquiry from ${data.name}`,
    html: `<p><strong>Name:</strong> ${data.name}</p><p><strong>Message:</strong> ${data.message}</p>`
  })

  return { success: true }
}
