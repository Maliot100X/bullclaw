import { NextRequest, NextResponse } from 'next/server';
import { getTrades } from '@/lib/data-source';

export async function GET(request: NextRequest) {
  try {
    const result = await getTrades(request.nextUrl.searchParams.get('agentId') ?? undefined);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('trades route error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load trades' }, { status: 500 });
  }
}
