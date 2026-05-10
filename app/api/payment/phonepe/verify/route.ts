import { PhonePe } from '@/lib/payment/PhonePe';
import { createAdminClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { finalizeBooking } from '@/lib/actions';

export async function POST(req: Request) {
  try {
    const { transactionId } = await req.json();

    if (!transactionId) {
      return NextResponse.json({ success: false, error: 'Missing Transaction ID' }, { status: 400 });
    }

    // 1. Check status with PhonePe SDK
    const statusResult = await PhonePe.checkStatus(transactionId);

    if (statusResult.success && statusResult.code === 'PAYMENT_SUCCESS') {
      const adminSupabase = await createAdminClient();

      // 2. Check if already completed to avoid double processing
      const { data: existing } = await adminSupabase
        .from('pre_booking_questionnaires')
        .select('payment_status, id')
        .eq('transaction_id', transactionId)
        .single();

      if (existing && existing.payment_status !== 'completed') {
        if (!statusResult.data) {
          throw new Error('Payment success but no data returned from PhonePe');
        }

        // 3. Update DB
        await adminSupabase
          .from('pre_booking_questionnaires')
          .update({ 
            payment_status: 'completed',
            payment_id: statusResult.data.transactionId 
          })
          .eq('transaction_id', transactionId);

        // 4. Finalize Booking (Notifications + Admin Alerts)
        await finalizeBooking(existing.id);
        
        console.log(`Payment verified and booking finalized for: ${transactionId}`);
        return NextResponse.json({ success: true, message: 'Payment verified successfully' });
      }

      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    return NextResponse.json({ success: false, error: 'Payment not successful yet' });
  } catch (error: any) {
    console.error('Verify Payment Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
