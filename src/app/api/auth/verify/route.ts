import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyOneTimeCode, generateSessionToken, storeSession } from '@/lib/auth';
import { z } from 'zod';

const VerifySchema = z.object({
  code: z.string().length(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = VerifySchema.parse(body);

    // Verify one-time code
    const otcData = await verifyOneTimeCode(parsed.code);

    if (!otcData) {
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 400 }
      );
    }

    // Check if user exists or create new user
    let user;

    if (otcData.wallet) {
      user = await prisma.user.upsert({
        where: { wallet: otcData.wallet },
        update: { updatedAt: new Date() },
        create: {
          wallet: otcData.wallet,
          riskLevel: 'medium',
          ansemHolder: false,
        },
      });
    } else if (otcData.telegramId) {
      user = await prisma.user.upsert({
        where: { telegramId: otcData.telegramId },
        update: { updatedAt: new Date() },
        create: {
          telegramId: otcData.telegramId,
          riskLevel: 'medium',
          ansemHolder: false,
        },
      });
    } else {
      return NextResponse.json(
        { error: 'No valid registration data' },
        { status: 400 }
      );
    }

    // Create session
    const sessionToken = generateSessionToken();
    await storeSession(sessionToken, user.id);

    // Store session in database
    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'user_registered',
        details: JSON.stringify({
          type: otcData.wallet ? 'wallet' : 'telegram',
          wallet: otcData.wallet,
          telegramId: otcData.telegramId,
        }),
      },
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          wallet: user.wallet,
          telegramId: user.telegramId,
        },
        sessionToken,
        expiresIn: 604800,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
