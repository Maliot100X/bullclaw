import { NextRequest, NextResponse } from 'next/server';
import { generateOneTimeCode, storeOneTimeCode } from '@/lib/auth';
import { z } from 'zod';

const RegisterSchema = z.object({
  type: z.enum(['wallet', 'telegram']),
  walletAddress: z.string().optional(),
  telegramId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RegisterSchema.parse(body);

    if (parsed.type === 'wallet' && !parsed.walletAddress) {
      return NextResponse.json(
        { error: 'walletAddress required for wallet registration' },
        { status: 400 }
      );
    }

    if (parsed.type === 'telegram' && !parsed.telegramId) {
      return NextResponse.json(
        { error: 'telegramId required for telegram registration' },
        { status: 400 }
      );
    }

    // Generate one-time code
    const code = await generateOneTimeCode();

    // Store in Redis
    await storeOneTimeCode(code, parsed.telegramId, parsed.walletAddress);

    // Return code to be displayed to user
    return NextResponse.json(
      {
        success: true,
        code,
        message: 'One-time code generated. Valid for 10 minutes.',
        expiresIn: 600,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
