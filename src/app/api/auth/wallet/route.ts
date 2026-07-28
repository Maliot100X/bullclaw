import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateSessionToken, storeSession } from '@/lib/auth';
import { z } from 'zod';

const WalletAuthSchema = z.object({
  wallet: z.string().min(32).max(64),
  signature: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = WalletAuthSchema.parse(body);

    // Find or create user by wallet
    let user = await prisma.user.findUnique({
      where: { wallet: parsed.wallet },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          wallet: parsed.wallet,
          riskLevel: 'medium',
          ansemHolder: false,
        },
      });

      // Log user registration
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'user_registered',
          details: JSON.stringify({
            method: 'wallet',
            wallet: parsed.wallet,
          }),
        },
      });
    }

    // Generate session token
    const sessionToken = generateSessionToken();
    await storeSession(sessionToken, user.id, 30 * 24 * 60 * 60); // 30 days

    // Store session in database
    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Get user's agents
    const agents = await prisma.agent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        wallet: user.wallet,
        ansemHolder: user.ansemHolder,
        riskLevel: user.riskLevel,
      },
      sessionToken,
      agents: agents.map((a) => ({
        id: a.id,
        name: a.name,
        status: a.status,
        totalPnL: a.totalPnL,
        feeEarnings: a.feeEarnings,
      })),
      expiresIn: 2592000, // 30 days in seconds
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Wallet auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
