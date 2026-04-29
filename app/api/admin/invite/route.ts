import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { resend } from '@/lib/resend'
import { WhatsAppManager } from '@/lib/whatsapp/WhatsAppClient'
import { normalizePhone } from '@/utils/phone'

export async function POST(request: Request) {
  const supabase = await createClient()
  const adminSupabase = await createAdminClient()

  // 1. Check if the current user is a Super Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleData?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email, full_name, phone_number } = await request.json()

  if (!email || !phone_number) return NextResponse.json({ error: 'Email and Phone number are required' }, { status: 400 })

  const formattedPhone = normalizePhone(phone_number)

  let user;
  const { data: userData, error: userError } = await adminSupabase.auth.admin.createUser({
    email,
    phone: formattedPhone,
    email_confirm: true,
    phone_confirm: true,
    user_metadata: { full_name }
  });

  if (userError && userError.message.toLowerCase().includes('already registered')) {
      const { data: userList } = await adminSupabase.auth.admin.listUsers();
      user = userList.users.find(u => u.email === email || u.phone === formattedPhone || u.phone === formattedPhone.replace('+', ''));
  } else {
      user = userData?.user;
  }

  if (!user) {
      return NextResponse.json({ error: 'Could not create or resolve user account.' }, { status: 500 });
  }

  // 3. Insert or update user_roles and therapist_profiles
  await adminSupabase.from('user_roles').upsert({
    user_id: user.id,
    role: 'admin',
    is_therapist: true,
    phone_number: formattedPhone
  }, { onConflict: 'user_id' });

  await adminSupabase.from('therapist_profiles').upsert({
    user_id: user.id,
    full_name: full_name || 'New Therapist',
    phone: formattedPhone
  }, { onConflict: 'user_id' });

  // 4. Send WhatsApp message
  const waMessage = `Hi ${full_name || 'there'},\n\nYou have been invited to join unHeard as a specialized therapist.\n\nPlease login at https://unheard.co.in/login with your phone number and OTP to complete your setup.`;
  await WhatsAppManager.sendMessage(formattedPhone, waMessage);

  const inviteLink = `${new URL(request.url).origin}/login`

  try {
    const { data, error } = await resend.emails.send({
      from: 'Unheard <onboarding@unheard.care>',
      to: [email],
      subject: 'Invite: Join the Unheard Therapist Team',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0F9393;">Welcome to unHeard.</h2>
          <p>Hi ${full_name || 'there'},</p>
          <p>You have been invited to join unHeard as a specialized therapist (Admin).</p>
          <p>Please click the link below to login using your phone number and OTP:</p>
          <a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Login to Unheard</a>
          <p style="margin-top: 20px; font-size: 14px; color: #666;">If you have any questions, please contact our support team.</p>
        </div>
      `,
    })

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 })
  }
}
