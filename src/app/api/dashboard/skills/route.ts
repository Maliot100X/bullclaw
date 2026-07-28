import { NextRequest, NextResponse } from 'next/server';
import { getSkills } from '@/lib/data-source';

export async function GET(request: NextRequest) {
  try {
    const result = await getSkills();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('skills route error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load skills' }, { status: 500 });
  }
}
