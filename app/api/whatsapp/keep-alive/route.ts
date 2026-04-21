import { NextResponse } from 'next/server';
import { WhatsAppManager } from '@/lib/whatsapp/WhatsAppClient';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Optional: Check for an authorization header to secure the cron job
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  console.log('🤖 WhatsApp Keep-Alive Cron Triggered...');

  try {
    // Wait up to 25 seconds for the connection to stabilize
    // (Vercel Hobby has a 10s timeout, Pro has 30s. We aim for a middle ground or respect the platform limits)
    const result = await WhatsAppManager.waitForAuthenticated(25000);
    
    return NextResponse.json({ 
      success: true, 
      status: result.status,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Keep-Alive Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
