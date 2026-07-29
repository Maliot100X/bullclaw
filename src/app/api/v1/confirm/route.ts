import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyOneTimeCode, generateSessionToken, storeSession } from '@/lib/auth';
import { z } from 'zod';
import { Redis } from '@upstash/redis';

const ConfirmSchema = z.object({
  code: z.string().length(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ConfirmSchema.parse(body);

    // Verify one-time code
    const otcData = await verifyOneTimeCode(parsed.code);
    if (!otcData) {
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 400 }
      );
    }

    // Get agent registration data from Redis
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    const agentDataKey = `agent_reg:${parsed.code}`;
    const agentDataValue = await redis.get(agentDataKey);

    if (!agentDataValue) {
      return NextResponse.json(
        { error: 'No agent data found for code' },
        { status: 400 }
      );
    }

    const agentData = JSON.parse(agentDataValue as string);
    await redis.del(agentDataKey);

    // Create system user for agent
    const systemUser = await prisma.user.create({
      data: {
        wallet: `agent_${agentData.agentId}`,
        riskLevel: 'medium',
        ansemHolder: false,
      },
    });

    // Create agent profile
    const agent = await prisma.agent.create({
      data: {
        userId: systemUser.id,
        name: agentData.agentName,
        persona: agentData.persona,
        model: agentData.model,
        template: 'custom',
        status: 'active',
        skillsJson: JSON.stringify([]),
      },
    });

    // Create session token
    const sessionToken = generateSessionToken();
    await storeSession(sessionToken, systemUser.id);

    // Store session in database
    await prisma.session.create({
      data: {
        userId: systemUser.id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        agentId: agent.id,
        userId: systemUser.id,
        action: 'agent_registered',
        details: JSON.stringify({
          agentName: agentData.agentName,
          agentId: agentData.agentId,
          model: agentData.model,
        }),
      },
    });

    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://bullclaw.vercel.app';

    return NextResponse.json(
      {
        success: true,
        agent: {
          id: agent.id,
          name: agent.name,
          walletAddress: agent.walletAddress,
          status: agent.status,
          model: agent.model,
          persona: agent.persona,
        },
        sessionToken,
        publicLink: `${baseUrl}/dashboard/agent/${agent.id}`,
        dashboardUrls: {
          home: `${baseUrl}/dashboard/agent/${agent.id}`,
          chat: `${baseUrl}/dashboard/agent/${agent.id}/chat`,
          terminal: `${baseUrl}/dashboard/agent/${agent.id}/terminal`,
          wallet: `${baseUrl}/dashboard/agent/${agent.id}/wallet`,
          skills: `${baseUrl}/dashboard/agent/${agent.id}/skills`,
          earnings: `${baseUrl}/dashboard/agent/${agent.id}/earnings`,
          marketplace: `${baseUrl}/dashboard/agent/${agent.id}/marketplace`,
          settings: `${baseUrl}/dashboard/agent/${agent.id}/settings`,
        },
        expiresIn: 2592000,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Confirmation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Confirmation failed', details: error.message },
      { status: 500 }
    );
  }
}
