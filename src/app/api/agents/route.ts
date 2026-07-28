import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get session token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
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

    // Get user's agents
    const agents = await prisma.agent.findMany({
      where: {
        userId: session.userId,
        status: { not: 'deleted' },
      },
      select: {
        id: true,
        clawpumpAgentId: true,
        name: true,
        persona: true,
        model: true,
        template: true,
        walletAddress: true,
        avatar: true,
        status: true,
        totalPnL: true,
        feeEarnings: true,
        listedForSale: true,
        salePrice: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      {
        success: true,
        agents,
        count: agents.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('List agents error:', error);
    return NextResponse.json(
      { error: 'Failed to list agents' },
      { status: 500 }
    );
  }
}
