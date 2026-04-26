import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();
    if (!phone || !otp) return NextResponse.json({ success: false, error: 'Phone and OTP are required' }, { status: 400 });

    const adminSupabase = await createAdminClient();
    
    // 1. Verify the WhatsApp OTP record
    const { data: otpRecord, error: otpError } = await adminSupabase
      .from('booking_otps')
      .select('*')
      .eq('phone_number', phone)
      .eq('verified', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (otpError || !otpRecord) {
       return NextResponse.json({ success: false, error: 'OTP is missing or has expired.' }, { status: 400 });
    }

    if (otpRecord.otp_code !== otp) {
       return NextResponse.json({ success: false, error: 'Incorrect OTP code.' }, { status: 400 });
    }

    // 2. Mark as verified in our custom table
    await adminSupabase.from('booking_otps').update({ verified: true }).eq('id', otpRecord.id);

    // 3. Supabase Auth Integration - "Silent Sign-In"
    const clientSupabase = await createClient();
    
    // a. Ensure user exists and phone is confirmed
    // We try to create the user first. If they exist, this will error but we proceed to magiclink.
    await adminSupabase.auth.admin.createUser({
        phone: phone,
        phone_confirm: true,
        user_metadata: { phone_verified: true, verified_at: new Date().toISOString() }
    }).catch(() => {}); // Ignore "already registered" error

    const { data: userLinkData, error: linkError } = await (adminSupabase.auth.admin as any).generateLink({
      type: 'magiclink',
      phone: phone,
    });

    let authSession = null;
    const hash = userLinkData?.properties?.hash || userLinkData?.properties?.token_hash;

    if (!linkError && hash) {
        // Use the generated hash to verify and create a session
        const { data: sessionData, error: verifyError } = await clientSupabase.auth.verifyOtp({
            phone: phone,
            token: hash,
            type: 'magiclink'
        } as any);
        
        if (!verifyError && sessionData.session) {
            authSession = sessionData.session;
        }
    } 

    if (!authSession) {
        // Fallback or detailed error
        console.error('AUTH SYNC ERROR:', linkError);
        return NextResponse.json({ success: false, error: 'Failed to synchronize authentication session.' }, { status: 500 });
    }

    // 4. Set custom 9-day expiry for cookies
    const cookieStore = await cookies();
    const expiry = 9 * 24 * 60 * 60; // 9 days in seconds

    // Supabase cookies usually start with 'sb-' followed by a hash of the project URL
    // We should ensure the cookies that were just set by clientSupabase.auth.verifyOtp
    // are updated with the 9-day maxAge.
    
    const allCookies = cookieStore.getAll();
    allCookies.forEach(cookie => {
        if (cookie.name.includes('auth-token') || cookie.name.startsWith('sb-')) {
            cookieStore.set(cookie.name, cookie.value, {
                maxAge: expiry,
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production'
            });
        }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Verified and logged in for 9 days.',
      user_id: authSession.user.id,
      session: authSession
    });

  } catch (error: any) {
    console.error('VERIFY OTP CRITICAL ERROR:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
