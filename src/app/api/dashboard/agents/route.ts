import { NextRequest, NextResponse } from 'next/server';
import { getAgents } from '@/lib/data-source';

export async function GET(request: NextRequest) {
  try {
    const result = await getAgents();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('agents route error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load agents' }, { status: 500 });
  }
}
