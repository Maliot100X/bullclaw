import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { clawpumpClient } from '@/lib/clawpump-client';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const CreateAgentSchema = z.object({
  name: z.string().min(1).max(100),
  persona: z.string().min(1).max(500),
  model: z.string().default('claude-sonnet-4-6'),
  template: z.enum(['ansem-trader', 'perps-sniper', 'memecoin-launcher', 'portfolio-manager', 'custom']).default('custom'),
  skills: z.array(z.string()).default([]),
});

export async function POST(request: NextRequest) {
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

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse request
    const body = await request.json();
    const parsed = CreateAgentSchema.parse(body);

    // Call ClawPump API to create agent
    const clawpumpAgent = await clawpumpClient.createAgent({
      name: parsed.name,
      persona: parsed.persona,
      model: parsed.model,
      skillsJson: JSON.stringify(parsed.skills),
      template: parsed.template,
    });

    // Get wallet info from ClawPump
    const walletInfo = await clawpumpClient.getWalletInfo(clawpumpAgent.id);

    // Create BullClaw agent record
    const agent = await prisma.agent.create({
      data: {
        userId: user.id,
        clawpumpAgentId: clawpumpAgent.id,
        walletAddress: walletInfo.address,
        name: parsed.name,
        persona: parsed.persona,
        model: parsed.model,
        template: parsed.template,
        skillsJson: JSON.stringify(parsed.skills),
        status: 'active',
      },
    });

    // Get dashboard URLs
    const dashboardUrls = await clawpumpClient.getDashboardUrls(clawpumpAgent.id);

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        agentId: agent.id,
        action: 'agent_created',
        details: JSON.stringify({
          name: parsed.name,
          template: parsed.template,
          walletAddress: walletInfo.address,
          clawpumpAgentId: clawpumpAgent.id,
        }),
      },
    });

    return NextResponse.json(
      {
        success: true,
        agent: {
          id: agent.id,
          clawpumpAgentId: agent.clawpumpAgentId,
          name: agent.name,
          walletAddress: agent.walletAddress,
          status: agent.status,
          model: agent.model,
          template: agent.template,
        },
        wallet: {
          address: walletInfo.address,
          balance: walletInfo.balance || 0,
        },
        dashboardUrls,
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

    console.error('Agent creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Agent creation failed' },
      { status: 500 }
    );
  }
}
