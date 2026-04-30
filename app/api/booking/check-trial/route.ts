import { NextRequest, NextResponse } from 'next/server';
import { IdentityManager } from '@/lib/identity/IdentityManager';

export async function POST(req: NextRequest) {
  try {
    const { phone, deviceId, userId } = await req.json();
    
    const identity = await IdentityManager.resolveIdentity(phone, deviceId, userId);
    
    return NextResponse.json({
      success: true,
      available: identity ? !identity.is_trial_claimed : true
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
