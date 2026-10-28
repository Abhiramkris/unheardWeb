import { NextResponse } from 'next/server';
import { WhatsAppManager } from '@/lib/whatsapp/WhatsAppClient';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  try {
    const state = await WhatsAppManager.getStatus();
    
    // Auto-initialize if it hasn't been started yet
    if (state.status === 'disconnected') {
      await WhatsAppManager.getClient();
    }

    return NextResponse.json({
      success: true,
      data: await WhatsAppManager.getStatus()
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
