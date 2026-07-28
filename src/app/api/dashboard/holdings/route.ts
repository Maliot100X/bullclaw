import { NextResponse } from 'next/server';
import { getHoldings } from '@/lib/data-source';

export async function GET() {
  try {
    const result = await getHoldings();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('holdings route error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load holdings' }, { status: 500 });
  }
}
