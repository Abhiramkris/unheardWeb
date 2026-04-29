import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { normalizePhone } from '@/utils/phone';

export async function POST(req: Request) {
  try {
    const { phone: rawPhone, otp } = await req.json();
    if (!rawPhone || !otp) return NextResponse.json({ success: false, error: 'Phone and OTP are required' }, { status: 400 });

    const phone = normalizePhone(rawPhone);

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
       // Increment attempts
       await adminSupabase
         .from('booking_otps')
         .update({ attempts: (otpRecord.attempts || 0) + 1 })
         .eq('id', otpRecord.id);

       if ((otpRecord.attempts || 0) + 1 >= 5) {
         return NextResponse.json({ success: false, error: 'Too many failed attempts. Please request a new code.' }, { status: 403 });
       }
       return NextResponse.json({ success: false, error: 'Incorrect OTP code.' }, { status: 400 });
    }

    // 2. Mark as verified in our custom table
    await adminSupabase.from('booking_otps').update({ verified: true }).eq('id', otpRecord.id);

    // 3. Ensure Supabase Auth User exists
    let user;
    const { data: userData, error: userError } = await adminSupabase.auth.admin.createUser({
      phone: phone,
      phone_confirm: true,
      user_metadata: { phone_verified: true, verified_at: new Date().toISOString() }
    });

    if (userError && userError.message.toLowerCase().includes('already registered')) {
        // Fetch existing user by phone
        const { data: userList } = await adminSupabase.auth.admin.listUsers();
        user = userList.users.find(u => u.phone === phone || u.phone === phone.replace('+', ''));
    } else {
        user = userData?.user;
    }

    if (!user) {
        return NextResponse.json({ success: false, error: 'Could not resolve user account.' }, { status: 500 });
    }
    console.log('AUTH USER RESOLVED:', user.id, 'Phone:', user.phone);

    // 4. SYNC USER ROLES (Bridge Phone with User ID)
    console.log('SYNC ROLE - Searching for phone:', phone);
    // Check if there's a role pre-assigned to this phone number
    const { data: existingRole, error: fetchError } = await adminSupabase
      .from('user_roles')
      .select('*')
      .eq('phone_number', phone)
      .maybeSingle();

    if (fetchError) console.error('SYNC ROLE - Fetch Error:', fetchError);

    if (existingRole) {
      console.log('SYNC ROLE - Found existing role:', existingRole.role, 'Current user_id:', existingRole.user_id);
      if (!existingRole.user_id || existingRole.user_id !== user.id) {
        // Link the pre-assigned role to this new user_id
        const { error: updateError } = await adminSupabase
          .from('user_roles')
          .update({ user_id: user.id })
          .eq('id', existingRole.id);
        
        if (updateError) console.error('SYNC ROLE - Update Error:', updateError);
        else console.log('SYNC ROLE - Linked phone to user_id successfully');
      }
    } else {
      console.log('SYNC ROLE - No role found for phone, creating default patient');
      // Create a default patient role if nothing exists
      await adminSupabase
        .from('user_roles')
        .insert([{ 
          user_id: user.id, 
          phone_number: phone, 
          role: 'patient' 
        }]);
      console.log('CREATED DEFAULT ROLE [phone]:', phone);
    }

    // 4. Generate CUSTOM SUPABASE JWT
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('SUPABASE_JWT_SECRET is not configured in environment variables.');
    }

    const expiryTime = 9 * 24 * 60 * 60; // 9 days in seconds
    const exp = Math.floor(Date.now() / 1000) + expiryTime;

    const payload = {
        aud: 'authenticated',
        role: 'authenticated',
        sub: user.id,
        phone: user.phone,
        app_metadata: user.app_metadata || { provider: 'phone' },
        user_metadata: user.user_metadata || {},
        exp: exp
    };

    const token = jwt.sign(payload, jwtSecret);
    console.log('JWT SIGNED SUCCESS [phone]:', phone, '[token-exists]:', !!token);

    // 5. Set Cookies manually
    const cookieStore = await cookies();
    
    // We set the standard Supabase cookie names (Next.js SSR pattern)
    // Note: The specific cookie name might vary based on your supabase/ssr configuration, 
    // but usually it's sb-[project-id]-auth-token or similar. 
    // Since we use @supabase/ssr, we follow its default pattern.
    
    const cookieOptions = {
        maxAge: expiryTime,
        path: '/',
        httpOnly: true,
        sameSite: 'lax' as const,
        secure: process.env.NODE_ENV === 'production'
    };

    cookieStore.set('sb-access-token', token, cookieOptions);
    // For refresh token, we can just set the same or a dummy as we are doing custom auth
    cookieStore.set('sb-refresh-token', token, cookieOptions); 

    return NextResponse.json({ 
      success: true, 
      message: 'Logged in successfully via WhatsApp.',
      user_id: user.id,
      access_token: token,
      session: {
        access_token: token,
        refresh_token: token,
        user: user,
        expires_at: exp
      }
    });

  } catch (error: any) {
    console.error('VERIFY OTP CRITICAL ERROR:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
