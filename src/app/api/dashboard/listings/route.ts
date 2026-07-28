import { NextResponse } from 'next/server';
import { getListings } from '@/lib/data-source';

export async function GET() {
  try {
    const result = await getListings();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('listings route error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load listings' }, { status: 500 });
  }
}
