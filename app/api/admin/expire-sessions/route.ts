import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const userClient = await createClient()
    const { data: { user: currentUser } } = await userClient.auth.getUser()
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { data: roleData } = await userClient
      .from('user_roles')
      .select('role')
      .eq('user_id', currentUser.id)
      .single()

    if (!roleData?.role || !['admin', 'super_admin'].includes(roleData.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const supabase = await createAdminClient()
    const now = new Date();
    
    // Sessions starting more than 3 hours ago are expired if not completed
    const expiryThreshold = new Date(now.getTime() - 3 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .lt('start_time', expiryThreshold.toISOString())
      .not('status', 'eq', 'completed')
      .not('status', 'eq', 'cancelled')
      .select()

    if (error) {
      console.error('Session Expiration Error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      expired_count: data?.length || 0 
    })
  } catch (error: any) {
    console.error('API Route Fatal Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
