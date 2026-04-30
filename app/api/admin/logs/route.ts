import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { logAdminActivity, LogAction } from '@/utils/logger';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { action, target_id, details } = await req.json();

    if (!action) {
      return NextResponse.json({ success: false, error: 'Action is required' }, { status: 400 });
    }

    await logAdminActivity(user.id, action as LogAction, target_id, details);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
