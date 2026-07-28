import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get session token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const session = await getSession(token);

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return holder status
    return NextResponse.json({
      ansemHolder: user.ansemHolder,
      wallet: user.wallet,
      riskLevel: user.riskLevel,
      benefits: user.ansemHolder
        ? {
            premiumSkills: true,
            higherAgentLimit: 10,
            reducedFees: '50%',
            prioritySupport: true,
          }
        : {
            premiumSkills: false,
            higherAgentLimit: 3,
            reducedFees: '0%',
            prioritySupport: false,
          },
    });
  } catch (error) {
    console.error('Ansem holder check error:', error);
    return NextResponse.json(
      { error: 'Failed to check holder status' },
      { status: 500 }
    );
  }
}
