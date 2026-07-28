import { NextRequest, NextResponse } from 'next/server';
import { getStats } from '@/lib/data-source';

export async function GET(request: NextRequest) {
  try {
    const result = await getStats();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('stats route error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load stats' }, { status: 500 });
  }
}
